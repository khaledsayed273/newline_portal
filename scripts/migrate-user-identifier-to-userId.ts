import "dotenv/config";
import mysql from "mysql2/promise";

function fail(message: string) {
  console.error("❌ migrate-user-identifier-to-userId: " + message);
  process.exit(1);
}

async function columnExists(conn: any, table: string, column: string) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
    [table, column]
  );
  return Number((rows as any[])[0].cnt) > 0;
}

async function indexExists(conn: any, table: string, indexName: string) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.statistics
     WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
    [table, indexName]
  );
  return Number((rows as any[])[0].cnt) > 0;
}

async function tableExists(conn: any, table: string) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [table]
  );
  return Number((rows as any[])[0].cnt) > 0;
}

async function main() {
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
    fail(
      `تعذر الاتصال بقاعدة البيانات: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const log = (msg: string) => console.log("  " + msg);

  try {
    console.log("🔄 بدء ترحيل userIdentifier → userId...\n");

    // ========== 0. حذف جدول trainee_profiles إذا كان لا يزال موجوداً ==========
    console.log("📋 trainee_profiles (التحقق من الحذف):");
    if (await tableExists(conn, "trainee_profiles")) {
      // نسخ البيانات المتبقية إلى users قبل الحذف (إذا لم تكن منقولة بالفعل)
      await conn.query(
        `UPDATE users u
         INNER JOIN trainee_profiles tp ON u.id = tp.userId
         SET u.name = tp.fullName,
             u.employeeNumber = tp.employeeId`
      );
      await conn.query("DROP TABLE trainee_profiles");
      log("✓ تم نسخ البيانات المتبقية وحذف جدول trainee_profiles");
    } else {
      log("ℹ جدول trainee_profiles غير موجود (مُسجل كمحذوف مسبقاً)");
    }

    // ========== 1. lesson_watch_progress ==========
    console.log("\n📋 lesson_watch_progress:");
    if (!(await columnExists(conn, "lesson_watch_progress", "userId"))) {
      await conn.query(
        "ALTER TABLE lesson_watch_progress ADD COLUMN userId int NULL"
      );
      log("✓ أُضيف عمود userId");
    } else {
      log("ℹ userId موجود مسبقاً");
    }

    if (await columnExists(conn, "lesson_watch_progress", "userIdentifier")) {
      const [r2] = await conn.query(
        `UPDATE lesson_watch_progress p
         INNER JOIN users u ON u.employeeNumber = p.userIdentifier
         SET p.userId = u.id
         WHERE p.userId IS NULL`
      );
      log(`✓ تم تحديث ${(r2 as any).affectedRows ?? 0} صف`);

      await conn.query(
        "ALTER TABLE lesson_watch_progress DROP COLUMN userIdentifier"
      );
      log("✓ حُذف عمود userIdentifier");
    } else {
      log("ℹ userIdentifier غير موجود — تم تخطي التحديث والحذف");
    }

    if (!(await indexExists(conn, "lesson_watch_progress", "lesson_watch_progress_userId_lessonId_unique"))) {
      await conn.query(
        "ALTER TABLE lesson_watch_progress ADD CONSTRAINT lesson_watch_progress_userId_lessonId_unique UNIQUE(userId, lessonId)"
      );
      log("✓ أُضيف unique(userId, lessonId)");
    } else {
      log("ℹ فهرس unique(userId, lessonId) موجود مسبقاً");
    }

    // ========== 3. course_ratings ==========
    console.log("\n📋 course_ratings:");
    if (!(await columnExists(conn, "course_ratings", "userId"))) {
      await conn.query(
        "ALTER TABLE course_ratings ADD COLUMN userId int NULL"
      );
      log("✓ أُضيف عمود userId");
    } else {
      log("ℹ userId موجود مسبقاً");
    }

    if (await columnExists(conn, "course_ratings", "userIdentifier")) {
      const [r3] = await conn.query(
        `UPDATE course_ratings r
         INNER JOIN users u ON u.employeeNumber = r.userIdentifier
         SET r.userId = u.id
         WHERE r.userId IS NULL`
      );
      log(`✓ تم تحديث ${(r3 as any).affectedRows ?? 0} صف`);

      await conn.query(
        "ALTER TABLE course_ratings DROP COLUMN userIdentifier"
      );
      log("✓ حُذف عمود userIdentifier");
    } else {
      log("ℹ userIdentifier غير موجود — تم تخطي التحديث والحذف");
    }

    // ========== 4. course_exam_attempts ==========
    console.log("\n📋 course_exam_attempts:");
    if (!(await columnExists(conn, "course_exam_attempts", "userId"))) {
      await conn.query(
        "ALTER TABLE course_exam_attempts ADD COLUMN userId int NULL"
      );
      log("✓ أُضيف عمود userId");
    } else {
      log("ℹ userId موجود مسبقاً");
    }

    if (await columnExists(conn, "course_exam_attempts", "userIdentifier")) {
      const [r4] = await conn.query(
        `UPDATE course_exam_attempts a
         INNER JOIN users u ON u.employeeNumber = a.userIdentifier
         SET a.userId = u.id
         WHERE a.userId IS NULL`
      );
      log(`✓ تم تحديث ${(r4 as any).affectedRows ?? 0} صف`);

      await conn.query(
        "ALTER TABLE course_exam_attempts DROP COLUMN userIdentifier"
      );
      log("✓ حُذف عمود userIdentifier");
    } else {
      log("ℹ userIdentifier غير موجود — تم تخطي التحديث والحذف");
    }

    // ========== 5. course_completion_certs ==========
    console.log("\n📋 course_completion_certs:");
    if (!(await columnExists(conn, "course_completion_certs", "userId"))) {
      await conn.query(
        "ALTER TABLE course_completion_certs ADD COLUMN userId int NULL"
      );
      log("✓ أُضيف عمود userId");
    } else {
      log("ℹ userId موجود مسبقاً");
    }

    if (await columnExists(conn, "course_completion_certs", "userIdentifier")) {
      const [r5] = await conn.query(
        `UPDATE course_completion_certs c
         INNER JOIN users u ON u.employeeNumber = c.userIdentifier
         SET c.userId = u.id
         WHERE c.userId IS NULL`
      );
      log(`✓ تم تحديث ${(r5 as any).affectedRows ?? 0} صف`);

      await conn.query(
        "ALTER TABLE course_completion_certs DROP COLUMN userIdentifier"
      );
      log("✓ حُذف عمود userIdentifier");
    } else {
      log("ℹ userIdentifier غير موجود — تم تخطي التحديث والحذف");
    }

    // ========== 6. enrollments unique(userId, courseId) ==========
    console.log("\n📋 enrollments:");
    if (await tableExists(conn, "enrollments")) {
      if (!(await indexExists(conn, "enrollments", "enrollments_userId_courseId_unique"))) {
        await conn.query(
          "ALTER TABLE enrollments ADD CONSTRAINT enrollments_userId_courseId_unique UNIQUE(userId, courseId)"
        );
        log("✓ أُضيف unique(userId, courseId)");
      } else {
        log("ℹ فهرس unique(userId, courseId) موجود مسبقاً");
      }
    } else {
      log("ℹ جدول enrollments غير موجود — تم التخطي");
    }

    console.log("\n✅ اكتمل الترحيل بنجاح.");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("❌ " + (err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
