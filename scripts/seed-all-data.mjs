import "dotenv/config";
import mysql from "mysql2/promise";
import { execFileSync } from "node:child_process";

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const targetUrl = process.env.TARGET_DATABASE_URL;

function fail(message) {
  throw new Error(`seed-all-data: ${message}`);
}

function quoteIdentifier(value) {
  return `\`${String(value).replaceAll("`", "``")}\``;
}

function parseUrl(value, name) {
  if (!value) fail(`${name} غير مضبوط`);
  const url = new URL(value);
  if (!url.pathname || url.pathname === "/") fail(`${name} لا يحتوي اسم قاعدة بيانات`);
  return {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    ssl: { rejectUnauthorized: false },
  };
}

async function connect(config, database = true) {
  const options = { ...config };
  if (!database) delete options.database;
  return mysql.createConnection(options);
}

async function tableNames(conn) {
  const [rows] = await conn.query("SHOW TABLES");
  return rows.map(row => Object.values(row)[0]);
}

async function columns(conn, table) {
  const [rows] = await conn.query(`SHOW COLUMNS FROM ${quoteIdentifier(table)}`);
  return rows.map(row => row.Field);
}

async function rows(conn, table) {
  const [result] = await conn.query(`SELECT * FROM ${quoteIdentifier(table)}`);
  return result;
}

async function createClone(source, target, sourceDb, targetTable, sourceTable) {
  const archiveName = `${targetTable}_legacy`;
  const [createRows] = await source.query(
    `SHOW CREATE TABLE ${quoteIdentifier(sourceTable)}`
  );
  const ddl = createRows[0]["Create Table"];
  const firstTable = new RegExp(
    `^CREATE TABLE ${quoteIdentifier(sourceTable)}`
  );
  const archiveDdl = ddl.replace(
    firstTable,
    `CREATE TABLE ${quoteIdentifier(archiveName)}`
  );
  await target.query(`DROP TABLE IF EXISTS ${quoteIdentifier(archiveName)}`);
  await target.query(archiveDdl);

  const sourceColumns = await columns(source, sourceTable);
  const sourceRows = await rows(source, sourceTable);
  const targetColumns = await columns(target, archiveName);
  const missingColumns = sourceColumns.filter(column => !targetColumns.includes(column));
  if (missingColumns.length > 0) {
    fail(
      `جدول ${archiveName} لا يحتوي الأعمدة الأصلية: ${missingColumns.join(", ")}`
    );
  }
  console.log(`   ↳ ${sourceTable}: ${sourceRows.length} صف`);
  await insertRows(target, archiveName, sourceColumns, sourceRows, archiveName);
  return { archiveName, sourceRows, sourceColumns };
}

async function createTableFromSource(source, target, targetTable, sourceTable) {
  const [createRows] = await source.query(
    `SHOW CREATE TABLE ${quoteIdentifier(sourceTable)}`
  );
  const ddl = createRows[0]["Create Table"];
  const firstTable = new RegExp(
    `^CREATE TABLE ${quoteIdentifier(sourceTable)}`
  );
  await target.query(
    ddl.replace(firstTable, `CREATE TABLE ${quoteIdentifier(targetTable)}`)
  );
}

async function insertRows(conn, table, columnNames, values, label = table) {
  if (values.length === 0) return;
  const columnSql = columnNames.map(quoteIdentifier).join(", ");
  const rowPlaceholder = `(${columnNames.map(() => "?").join(", ")})`;
  const batchSize = 250;
  for (let offset = 0; offset < values.length; offset += batchSize) {
    const batch = values.slice(offset, offset + batchSize);
    const params = [];
    for (const value of batch) {
      for (const column of columnNames) {
        params.push(toSqlValue(value[column]));
      }
    }
    try {
      await conn.query(
        `INSERT INTO ${quoteIdentifier(table)} (${columnSql}) VALUES ${batch
          .map(() => rowPlaceholder)
          .join(", ")}`,
        params
      );
    } catch (error) {
      throw new Error(
        `فشل نسخ ${label} عند الصف ${offset + 1}: ${error.message}`
      );
    }
  }
}

function addIdentifier(map, identifier, userId) {
  if (identifier === null || identifier === undefined || identifier === "") return;
  const key = String(identifier);
  const previous = map.get(key);
  if (previous !== undefined && previous !== userId) {
    throw new Error(`المعرف ${key} مرتبط بأكثر من مستخدم`);
  }
  map.set(key, userId);
}

function toSqlValue(value) {
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) return JSON.stringify(value);
  if (
    typeof value === "object" &&
    !(value instanceof Date) &&
    !Buffer.isBuffer(value)
  ) {
    return JSON.stringify(value);
  }
  return value;
}

async function main() {
  const sourceConfig = parseUrl(sourceUrl, "SOURCE_DATABASE_URL");
  const targetConfig = parseUrl(targetUrl, "TARGET_DATABASE_URL");
  if (
    sourceConfig.host === targetConfig.host &&
    sourceConfig.port === targetConfig.port &&
    sourceConfig.database === targetConfig.database
  ) {
    fail("قاعدة المصدر والهدف متطابقتان، أوقف التشغيل لحماية البيانات");
  }

  const source = await connect(sourceConfig);
  const server = await connect(targetConfig, false);
  await server.query(
    `CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(targetConfig.database)}`
  );
  await server.end();
  const target = await connect(targetConfig);

  try {
    const existingTargetTables = await tableNames(target);
    if (existingTargetTables.length > 0) {
      fail(
        `قاعدة الهدف ليست فارغة: ${existingTargetTables.join(", ")}. استخدم قاعدة جديدة.`
      );
    }

    console.log("1/6 إنشاء schema الحالي في قاعدة الهدف...");
    execFileSync(process.platform === "win32" ? "pnpm.cmd" : "pnpm", [
      "exec",
      "drizzle-kit",
      "push",
    ], {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, DATABASE_URL: targetUrl },
    });

    const sourceTables = await tableNames(source);
    const targetTables = new Set(await tableNames(target));
    const legacyTables = new Set([
      "users",
      "trainee_profiles",
      "lesson_watch_progress",
      "course_ratings",
      "course_exam_attempts",
      "course_completion_certs",
      "path_progress",
    ]);

    console.log("2/6 حفظ البيانات القديمة داخل جداول legacy...");
    for (const table of sourceTables) {
      if (table === "__drizzle_migrations") continue;
      if (legacyTables.has(table)) {
        await createClone(source, target, sourceConfig.database, table, table);
      }
    }

    const sourceUsers = sourceTables.includes("users") ? await rows(source, "users") : [];
    const profiles = sourceTables.includes("trainee_profiles")
      ? await rows(source, "trainee_profiles")
      : [];
    const userByOldIdentifier = new Map();
    const userById = new Map(sourceUsers.map(user => [Number(user.id), user]));
    const profileByIdentifier = new Map(
      profiles
        .filter(profile => profile.userIdentifier !== undefined)
        .map(profile => [String(profile.userIdentifier), profile])
    );
    const userEmployeeNumbers = new Map();
    const employeeNumbers = new Set();

    for (const user of sourceUsers) {
      const profile =
        profileByIdentifier.get(String(user.openId ?? "")) ??
        profileByIdentifier.get(String(user.email ?? ""));
      const employeeNumber =
        user.employeeNumber ?? profile?.employeeId ?? null;
      if (!employeeNumber) {
        fail(
          `لا يوجد employeeNumber للمستخدم القديم id=${user.id}. لن يتم تخمين قيمة.`
        );
      }
      const normalized = String(employeeNumber).trim();
      if (employeeNumbers.has(normalized)) {
        fail(`employeeNumber مكرر: ${normalized}`);
      }
      employeeNumbers.add(normalized);
      userEmployeeNumbers.set(Number(user.id), normalized);
      for (const key of [user.openId, user.email, user.employeeNumber]) {
        addIdentifier(userByOldIdentifier, key, Number(user.id));
      }
      if (profile?.userIdentifier !== undefined) {
        addIdentifier(userByOldIdentifier, profile.userIdentifier, Number(user.id));
      }
    }

    const transformedTables = new Set([
      "lesson_watch_progress",
      "course_ratings",
      "course_exam_attempts",
      "course_completion_certs",
    ]);
    const userIdentifierTables = [...transformedTables, "path_progress"];
    const unresolved = [];
    for (const table of userIdentifierTables) {
      if (!sourceTables.includes(table)) continue;
      const sourceColumns = await columns(source, table);
      if (!sourceColumns.includes("userIdentifier")) continue;
      for (const row of await rows(source, table)) {
        if (!userByOldIdentifier.has(String(row.userIdentifier))) {
          unresolved.push(`${table}#${row.id}:${row.userIdentifier}`);
        }
      }
    }
    if (unresolved.length > 0) {
      fail(
        `تعذر ربط ${unresolved.length} صفًا بمستخدم. أمثلة: ${unresolved
          .slice(0, 10)
          .join(", ")}`
      );
    }

    console.log("3/6 نقل users...");
    const targetUserColumns = await columns(target, "users");
    const userValues = sourceUsers.map(user => ({
      id: user.id,
      employeeNumber: userEmployeeNumbers.get(Number(user.id)),
      name: user.name ?? null,
      passwordHash: user.passwordHash ?? user.password ?? null,
      role: user.role ?? "user",
      department: user.department ?? null,
      jobTitle: user.jobTitle ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastSignedIn: user.lastSignedIn,
    }));
    await insertRows(
      target,
      "users",
      targetUserColumns.filter(column => userValues.some(value => column in value)),
      userValues
    );

    console.log("4/6 نقل الجداول المتغيرة...");
    for (const table of transformedTables) {
      if (!sourceTables.includes(table) || !targetTables.has(table)) continue;
      const sourceColumns = await columns(source, table);
      const sourceRows = await rows(source, table);
      const targetColumns = await columns(target, table);
      const values = sourceRows.map(row => ({
        ...row,
        userId: row.userIdentifier
          ? userByOldIdentifier.get(String(row.userIdentifier))
          : row.userId,
      }));
      const insertColumns = targetColumns.filter(column =>
        values.some(value => column in value)
      );
      if (sourceColumns.includes("userIdentifier") && !insertColumns.includes("userId")) {
        fail(`schema الهدف لا يحتوي userId في جدول ${table}`);
      }
      await insertRows(target, table, insertColumns, values);
    }

    console.log("5/6 نقل الجداول الأخرى...");
    for (const table of sourceTables) {
      if (
        table === "__drizzle_migrations" ||
        table === "users" ||
        table === "trainee_profiles" ||
        transformedTables.has(table) ||
        table === "path_progress"
      ) {
        continue;
      }
      if (!targetTables.has(table)) {
        console.warn(`⚠️  الجدول ${table} غير موجود في schema الهدف، تم حفظه كـ legacy فقط`);
        continue;
      }
      const sourceColumns = await columns(source, table);
      const targetColumns = await columns(target, table);
      const insertColumns = sourceColumns.filter(column => targetColumns.includes(column));
      await insertRows(target, table, insertColumns, await rows(source, table));
    }

    console.log("6/6 إنشاء path_progress والتحقق...");
    if (sourceTables.includes("path_progress")) {
      const pathColumns = await columns(source, "path_progress");
      if (!targetTables.has("path_progress")) {
        await createTableFromSource(source, target, "path_progress", "path_progress");
        const pathRows = await rows(source, "path_progress");
        const createdPathColumns = await columns(target, "path_progress");
        await insertRows(target, "path_progress", createdPathColumns, pathRows);
      }
      const targetPathColumns = await columns(target, "path_progress");
      if (!targetPathColumns.includes("userId")) {
        await target.query("ALTER TABLE `path_progress` ADD COLUMN `userId` int NULL");
      }
      if (pathColumns.includes("userIdentifier")) {
        const pathRows = await rows(source, "path_progress");
        for (const row of pathRows) {
          await target.query(
            "UPDATE `path_progress` SET `userId` = ? WHERE `id` = ?",
            [userByOldIdentifier.get(String(row.userIdentifier)), row.id]
          );
        }
      }
    }

    const [nullUsers] = await target.query(
      "SELECT COUNT(*) AS count FROM `users` WHERE `employeeNumber` IS NULL OR `employeeNumber` = ''"
    );
    if (Number(nullUsers[0].count) > 0) fail("يوجد users بدون employeeNumber في الهدف");
    console.log(`✅ اكتمل النقل إلى ${targetConfig.database} بدون تعديل المصدر.`);
  } finally {
    await source.end();
    await target.end();
  }
}

main().catch(error => {
  console.error(`❌ ${error.message}`);
  process.exit(1);
});
