import "dotenv/config";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import mysql from "mysql2/promise";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");

function fail(message) {
  console.error("❌ migrate-run: " + message);
  process.exit(1);
}

async function main() {
  // 1. قراءة التهجيرات والجورنال
  let migrations;
  let journalEntries;
  try {
    const journalRaw = await readFile(
      path.join(ROOT, "drizzle", "meta", "_journal.json"),
      "utf-8"
    );
    journalEntries = JSON.parse(journalRaw).entries;
    migrations = readMigrationFiles({
      migrationsFolder: path.join(ROOT, "drizzle"),
    });
    if (migrations.length !== journalEntries.length) {
      fail(
        `عدد التهجيرات (${migrations.length}) لا يطابق مدخلات journal (${journalEntries.length})`
      );
    }
    migrations = migrations.map((m, i) => ({
      ...m,
      tag: journalEntries[i].tag,
    }));
  } catch (err) {
    fail(`تعذر قراءة التهجيرات: ${err.message}`);
  }

  // 2. فحص الطوابع المستقبلية
  const now = Date.now();
  const FUTURE_MARGIN_MS = 60_000;
  const futureMigrations = migrations.filter(
    (m) => m.folderMillis > now + FUTURE_MARGIN_MS
  );
  if (futureMigrations.length > 0) {
    fail(
      `سجل التهجيرات يحتوي طوابع زمنية مستقبلية: ${futureMigrations
        .map((m) => m.tag)
        .join(", ")}`
    );
  }

  // 3. الاتصال بقاعدة البيانات
  if (!process.env.DATABASE_URL) {
    fail("DATABASE_URL غير مضبوط (افحص source/.env)");
  }
  const u = new URL(process.env.DATABASE_URL);
  let conn;
  try {
    conn = await mysql.createConnection({
      host: u.hostname,
      port: Number(u.port) || 3306,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
    });
  } catch (err) {
    fail(`تعذر الاتصال بقاعدة البيانات: ${err.message}`);
  }

  try {
    await conn.execute(
      "CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (`id` serial primary key, `hash` text NOT NULL, `created_at` bigint)"
    );
    const [dbRows] = await conn.query(
      "SELECT id, hash, created_at FROM `__drizzle_migrations`"
    );

    const appliedHashes = new Set(dbRows.map((r) => String(r.hash)));
    const maxAppliedTs = dbRows.reduce(
      (m, r) => Math.max(m, Number(r.created_at) || 0),
      0
    );

    const pending = migrations.filter(
      (m) => !appliedHashes.has(m.hash) && m.folderMillis > maxAppliedTs
    );

    if (pending.length === 0) {
      console.log("ℹ️  لا يوجد تغييرات جديدة للتطبيق");
      return;
    }

    console.log(
      `▶️  تهجيرات قادمة للتطبيق (${pending.length}): ${pending
        .map((m) => m.tag)
        .join(", ")}`
    );
  } finally {
    await conn.end();
  }

  // 4. تشغيل drizzle-kit migrate
  try {
    execSync("npx drizzle-kit migrate", {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env },
    });
  } catch (err) {
    fail(`فشل تطبيق التهجيرات: ${err.message}`);
  }
}

main().catch((err) => {
  console.error("❌ migrate-run: " + err.message);
  process.exit(1);
});
