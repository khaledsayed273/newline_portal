// حماية قبلية قبل drizzle-kit migrate — تمنع تكرار حادثة التخطي الصامت.
// الاستخدام: تُستدعى تلقائيًا من pnpm db:migrate (لا تشغيل يدوي مطلوب).
//
// ما تكتشفه:
//  1) أي تهجير في drizzle/meta/_journal.json بطابع زمني مستقبلي (when > الآن + دقيقة)
//     → فشل فوري برسالة إصلاح (هذا هو خطأ baseline القديم بالضبط).
//  2) صفوف __drizzle_migrations هاشها يطابق تهجيرًا معروفًا لكن طابعها الزمني
//     مختلف → تُحاذى تلقائيًا إلى قيمة الـ journal (تعديل طفيف وآمن).
//  3) صفوف غريبة (هاش لا يطابق أي تهجير) → تحذير فقط دون مساس.
//  4) عدّ التهجيرات القادمة للتطبيق، والتهجيرات المتخطاة عمدًا (حالة baseline/dump)
//     وعددها ونطاقها لظم الاطمئنان الخادع.
//
// الخروج: 0 = آمن، يُنفّذ drizzle-kit migrate؛ 1 = خطأ يمنع التنفيذ.
import "dotenv/config";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
// هامش الدقيقة: يسمح بفروق ساعة الخادم الصغيرة
const FUTURE_MARGIN_MS = 60_000;

function fail(message) {
  console.error("❌ db-migrate-guard: " + message);
  process.exit(1);
}

// 1. قراءة التهجيرات عبر نفس محرك drizzle (هاش ومحتوى متطابقان مع migrator)
// ملاحظة: كائنات Migration في هذا الإصدار لا تحمل tag، فنربطها بترتيب _journal.json
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
  if (String(err.message).startsWith("❌")) throw err;
  fail(`تعذر قراءة التهجيرات: ${err.message}`);
}

// 2. فحص الطوابع المستقبلية (جذر الحادثة)
const now = Date.now();
const futureMigrations = migrations.filter(m => m.folderMillis > now + FUTURE_MARGIN_MS);
if (futureMigrations.length > 0) {
  console.error("❌ سجل التهجيرات (drizzle/meta/_journal.json) يحتوي طوابع زمنية مستقبلية —");
  console.error("   migrator سيتخطى التهجير الحقيقي ويظهر نجاحًا كاذبًا. التهجيرات المتأثرة:");
  for (const m of futureMigrations) {
    console.error(`   - ${m.tag}: when=${m.folderMillis}`);
  }
  console.error("   الإصلاح: اضبط قيمة `when` لهذه المدخلات إلى وقت واقعي (Date.now() مثلًا)،");
  console.error("   وسوِّ الصف المقابل في جدول __drizzle_migrations بنفس القيمة.");
  process.exit(1);
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

  // 4. محاذاة الصفوف المطابقة (idempotent وآمن)
  const byHash = new Map(migrations.map(m => [m.hash, m]));
  let alignmentChanged = false;
  for (const row of dbRows) {
    const match = byHash.get(String(row.hash));
    if (match && Number(row.created_at) !== match.folderMillis) {
      await conn.execute(
        "UPDATE `__drizzle_migrations` SET `created_at` = ? WHERE `id` = ?",
        [match.folderMillis, row.id]
      );
      console.log(
        `✓ محاذاة صف سجل التهجير (${match.tag}): created_at ${row.created_at} → ${match.folderMillis}`
      );
      alignmentChanged = true;
    }
  }

  // 5. الصفوف الغريبة (هاش لا يطابق أي تهجير معروف)
  const foreignRows = dbRows.filter(r => !byHash.has(String(r.hash)));
  if (foreignRows.length > 0) {
    console.warn("⚠️  صفوف سجل لا تطابق أي تهجير معروف (لم تُمس):");
    for (const r of foreignRows) {
      console.warn(
        `   - id=${r.id} hash=${String(r.hash).slice(0, 8)} created_at=${r.created_at}`
      );
    }
  }

  // 6. التصنيف: معلّق (سيُطبّق) / متخطى عمدًا (baseline/dump)
  const appliedHashes = new Set(dbRows.map(r => String(r.hash)));
  const effectiveRows = dbRows.map(r => {
    const match = byHash.get(String(r.hash));
    return match ? { ...r, created_at: match.folderMillis } : r;
  });
  const maxAppliedTs = effectiveRows.reduce(
    (m, r) => Math.max(m, Number(r.created_at) || 0),
    0
  );
  const pending = migrations.filter(
    m => !appliedHashes.has(m.hash) && m.folderMillis > maxAppliedTs
  );
  const skippedByDesign = migrations.filter(
    m => !appliedHashes.has(m.hash) && m.folderMillis <= maxAppliedTs
  );

  if (skippedByDesign.length > 0) {
    console.log(
      `ℹ️  ${skippedByDesign.length} تهجير متخطى عمدًا (حالة baseline/dump): ${skippedByDesign
        .map(m => m.tag)
        .join(", ")}`
    );
  }
  if (pending.length > 0) {
    console.log(
      `▶️  تهجيرات قادمة للتطبيق (${pending.length}): ${pending.map(m => m.tag).join(", ")}`
    );
  } else if (skippedByDesign.length === 0 && !alignmentChanged) {
    console.log("✅ جميع التهجيرات مسجلة — لا جديد للتطبيق.");
  }
} finally {
  await conn.end();
}

process.exit(0);
