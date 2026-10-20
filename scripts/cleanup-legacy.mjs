import "dotenv/config";
import mysql from "mysql2/promise";

const legacyTables = [
  "users_legacy",
  "trainee_profiles_legacy",
  "lesson_watch_progress_legacy",
  "course_ratings_legacy",
  "course_exam_attempts_legacy",
  "course_completion_certs_legacy",
  "path_progress_legacy",
];

const countPairs = [
  ["users", "users_legacy"],
  ["lesson_watch_progress", "lesson_watch_progress_legacy"],
  ["course_ratings", "course_ratings_legacy"],
  ["course_exam_attempts", "course_exam_attempts_legacy"],
  ["course_completion_certs", "course_completion_certs_legacy"],
  ["path_progress", "path_progress_legacy"],
];

function quoteIdentifier(value) {
  return `\`${String(value).replaceAll("`", "``")}\``;
}

function fail(message) {
  throw new Error(`cleanup-legacy: ${message}`);
}

async function main() {
  if (!process.env.DATABASE_URL) fail("DATABASE_URL غير مضبوط");
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    const [tableRows] = await conn.query("SHOW TABLES");
    const tables = new Set(tableRows.map(row => Object.values(row)[0]));
    const presentLegacyTables = legacyTables.filter(table => tables.has(table));

    if (presentLegacyTables.length === 0) {
      console.log("لا توجد جداول legacy للحذف.");
      return;
    }

    for (const [currentTable, legacyTable] of countPairs) {
      if (!tables.has(currentTable) || !tables.has(legacyTable)) continue;
      const [currentResult, legacyResult] = await Promise.all([
        conn.query(
          `SELECT COUNT(*) AS count FROM ${quoteIdentifier(currentTable)}`
        ),
        conn.query(
          `SELECT COUNT(*) AS count FROM ${quoteIdentifier(legacyTable)}`
        ),
      ]);
      const currentCount = currentResult[0][0].count;
      const legacyCount = legacyResult[0][0].count;
      if (Number(currentCount) !== Number(legacyCount)) {
        fail(
          `عدد الصفوف غير متطابق: ${currentTable}=${currentCount}, ${legacyTable}=${legacyCount}`
        );
      }
    }

    const checks = [
      ["lesson_watch_progress", "userId"],
      ["course_ratings", "userId"],
      ["course_exam_attempts", "userId"],
      ["course_completion_certs", "userId"],
    ];
    for (const [table, column] of checks) {
      if (!tables.has(table)) continue;
      const [[result]] = await conn.query(
        `SELECT COUNT(*) AS count FROM ${quoteIdentifier(table)} WHERE ${quoteIdentifier(column)} IS NULL`
      );
      if (Number(result.count) !== 0) {
        fail(`يوجد ${result.count} صف بدون ${column} في ${table}`);
      }
    }

    const orphanChecks = [
      "lesson_watch_progress",
      "course_ratings",
      "course_exam_attempts",
      "course_completion_certs",
    ];
    for (const table of orphanChecks) {
      if (!tables.has(table)) continue;
      const [[result]] = await conn.query(
        `SELECT COUNT(*) AS count
         FROM ${quoteIdentifier(table)} AS child
         LEFT JOIN \`users\` AS parent ON parent.\`id\` = child.\`userId\`
         WHERE parent.\`id\` IS NULL`
      );
      if (Number(result.count) !== 0) {
        fail(`يوجد ${result.count} صف orphan في ${table}`);
      }
    }

    console.log("✓ تم اجتياز فحوصات البيانات. حذف جداول legacy...");
    for (const table of presentLegacyTables) {
      await conn.query(`DROP TABLE ${quoteIdentifier(table)}`);
      console.log(`✓ تم حذف ${table}`);
    }
    console.log("✅ اكتمل تنظيف جداول legacy بدون تعديل الجداول الأساسية.");
  } finally {
    await conn.end();
  }
}

main().catch(error => {
  console.error(`❌ ${error.message}`);
  process.exit(1);
});
