// تسوية سجل المايجريشن لقاعدة بيانات مستوردة من dump (تُشغَّل مرة واحدة فقط).
// الاستخدام: node baseline_db.mjs --from-dump
//
// الفكرة: drizzle-kit migrate يتخطى أي مدخلة في _journal.json أقدم من آخر
// created_at في جدول __drizzle_migrations. هذا السكريبت يسجّل هذا الصف فقط
// بعد التحقق أن الجداول موجودة فعلاً — فمستحيل يتخطى مايجريشن حقيقية بالغلط.
// idempotent: آمن تماماً عند تكرار التشغيل.
import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const HERE = path.dirname(fileURLToPath(import.meta.url));

if (process.argv[2] !== "--from-dump") {
  console.error("Usage: node baseline_db.mjs --from-dump");
  console.error("This marks all current journal migrations as applied. Run only on a");
  console.error("database that was imported from a dump and already has all tables.");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (check source/.env)");
  process.exit(1);
}

// 1. قراءة الـ journal والتحقق من وجود ملفات الـ SQL
const journalRaw = await readFile(path.join(HERE, "drizzle", "meta", "_journal.json"), "utf-8");
const journal = JSON.parse(journalRaw);
for (const entry of journal.entries) {
  try {
    await readFile(path.join(HERE, "drizzle", `${entry.tag}.sql`), "utf-8");
  } catch {
    console.error(`Missing migration file for journal entry: ${entry.tag}`);
    process.exit(1);
  }
}
const maxWhen = Math.max(...journal.entries.map((e) => e.when));
const latest = journal.entries.reduce((a, b) => (a.when >= b.when ? a : b));

// فحص الطوابع المستقبلية (جذر حادثة التخطي الصامت): baseline على journal
// يحوي طابعًا زمنيًا مستقبليًا يجعل migrator يتخطى التهجيرات الحقيقية للأبد.
const FUTURE_MARGIN_MS = 60_000;
const now = Date.now();
const futureEntries = journal.entries.filter((e) => e.when > now + FUTURE_MARGIN_MS);
if (futureEntries.length > 0) {
  console.error("❌ سجل التهجيرات (drizzle/meta/_journal.json) يحتوي طوابع زمنية مستقبلية:");
  for (const e of futureEntries) {
    console.error(`   - ${e.tag}: when=${e.when}`);
  }
  console.error("   اضبط `when` لهذه المدخلات إلى وقت واقعي ثم أعد التشغيل.");
  process.exit(1);
}
const latestSql = await readFile(path.join(HERE, "drizzle", `${latest.tag}.sql`), "utf-8");
const latestHash = createHash("sha256").update(latestSql).digest("hex");

const conn = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const [[dbRow]] = await conn.execute("SELECT DATABASE() AS db");
  const dbName = dbRow.db;

  // 2. التحقق أن الجداول موجودة فعلاً قبل التسوية (شرط الأمان)
  const snapshotRaw = await readFile(
    path.join(HERE, "drizzle", "meta", `${latest.tag.split("_")[0]}_snapshot.json`),
    "utf-8"
  ).catch(() => null);
  let expectedTables = ["users", "courses", "departments", "brief_files"];
  if (snapshotRaw) {
    const snapshot = JSON.parse(snapshotRaw);
    const names = Object.keys(snapshot.tables ?? {});
    if (names.length > 0) expectedTables = names;
  }
  const [placeholders] = [expectedTables.map(() => "?").join(",")];
  const [rows] = await conn.execute(
    `SELECT TABLE_NAME AS t FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN (${placeholders})`,
    [dbName, ...expectedTables]
  );
  const found = new Set(rows.map((r) => r.t));
  const missing = expectedTables.filter((t) => !found.has(t));
  if (missing.length > 0) {
    console.error(`Refusing to baseline: missing tables: ${missing.join(", ")}`);
    console.error("Run drizzle-kit migrate normally instead.");
    process.exit(1);
  }

  // 3. إنشاء جدول السجل + فحص الحالة الحالية
  await conn.execute(
    "CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (`id` serial primary key, `hash` text NOT NULL, `created_at` bigint)"
  );
  const [[maxRow]] = await conn.execute("SELECT MAX(`created_at`) AS m FROM `__drizzle_migrations`");
  if (maxRow.m !== null && Number(maxRow.m) >= maxWhen) {
    console.log("Already baselined — nothing to do.");
  } else {
    await conn.execute("INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) VALUES (?, ?)", [
      latestHash,
      maxWhen,
    ]);
    console.log(`Baselined ${journal.entries.length} journal entries (created_at=${maxWhen}).`);
    console.log("Future drizzle-kit migrate runs will skip them.");
  }
} finally {
  await conn.end();
}
