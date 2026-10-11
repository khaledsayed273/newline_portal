import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // إضافة الدروس الخمسة فقط (الدورة موجودة بالفعل ID: 120023)
  const lessons = [
    {
      id: 120022,
      title: "اليوم الأول - نظام العمل الاحترافية",
      description: "تسجيل اليوم الأول - 27/06/2026 | كلمة المرور: z5kUqS=u",
      videoUrl: "https://us06web.zoom.us/rec/share/2dNkpjkIjNv2OW8y7QcB6WteeC2bpy0KcKFemLIBQb85JkWAA8zagGfkK-mZsC8m._TRgyz7eTvS3JD69?startTime=1782582685000",
      order: 1,
    },
    {
      id: 120023,
      title: "اليوم الثاني - نظام العمل الاحترافية",
      description: "تسجيل اليوم الثاني | كلمة المرور: U+ZY=77K",
      videoUrl: "https://us06web.zoom.us/rec/share/wY0z5EvMcdtbz2zXySQ_2BJOIWDUfxa_V-SsXN8dAZYEPJj6PVGQEkDMsuWpnoM.R89pzWQhAyITkrQi?startTime=1782658603000",
      order: 2,
    },
    {
      id: 120024,
      title: "اليوم الثالث - نظام العمل الاحترافية",
      description: "تسجيل اليوم الثالث | كلمة المرور: 8T.3#krp",
      videoUrl: "https://us06web.zoom.us/rec/share/Wi5ljcNZFKHi4EALFUvyOjiWtGtA1FoThdCjJftiyAOh7mIOqj_ooCyFV0MerzA.Ssz49TRvVCk2B7Zh?startTime=1782744398000",
      order: 3,
    },
    {
      id: 120025,
      title: "اليوم الرابع - نظام العمل الاحترافية",
      description: "تسجيل اليوم الرابع | كلمة المرور: dJ#W^0^&",
      videoUrl: "https://us06web.zoom.us/rec/share/qNKcO-jSMu-sShEBoAAm5Xk2pSfzl7nC081sgWRLZ23f9gXt6pyBRoSmMeQr6TRr.hbelGZ_48W24MKR5?startTime=1782830752000",
      order: 4,
    },
    {
      id: 120026,
      title: "اليوم الخامس - نظام العمل الاحترافية",
      description: "تسجيل اليوم الخامس | كلمة المرور: q4Fs6*@C",
      videoUrl: "https://us06web.zoom.us/rec/share/v9_hR4_3lDfpvpZowlLfKnMrmWDJJ1qjJUs2TVn0mPivHDIquf26IEip2GlzHEk.Cr3h-xp4zrX82gV7?startTime=1782923115000",
      order: 5,
    },
  ];

  for (const lesson of lessons) {
    try {
      await conn.execute(
        "INSERT INTO course_lessons (id, courseId, title, description, videoUrl, videoType, duration, `order`, isPublished, createdAt) VALUES (?, ?, ?, ?, ?, 'embed', NULL, ?, 1, NOW())",
        [lesson.id, 120023, lesson.title, lesson.description, lesson.videoUrl, lesson.order]
      );
      console.log(`✅ تم إضافة الدرس: ${lesson.title}`);
    } catch (e) {
      if (e.code === "ER_DUP_ENTRY") {
        console.log(`⚠️ الدرس موجود بالفعل: ${lesson.title}`);
      } else {
        throw e;
      }
    }
  }

  // ربط الدورة بالمسار إذا لم تكن مرتبطة
  const [existing] = await conn.query(
    "SELECT id FROM course_path_items WHERE courseId = 120023 AND pathId = 30001"
  );
  if (existing.length === 0) {
    // تحديث ترتيب الدورات الحالية (+1)
    await conn.execute("UPDATE course_path_items SET `order` = `order` + 1 WHERE pathId = 30001");
    console.log("✅ تم تحديث ترتيب الدورات الحالية");
    // إضافة الدورة في الترتيب الأول
    await conn.execute(
      "INSERT INTO course_path_items (id, pathId, courseId, `order`) VALUES (150002, 30001, 120023, 1)"
    );
    console.log("✅ تم ربط الدورة بالمسار التأسيسي (30001)");
  } else {
    console.log("⚠️ الدورة مرتبطة بالمسار بالفعل");
  }

  // التحقق النهائي
  const [items] = await conn.query(
    "SELECT cpi.`order`, c.title FROM course_path_items cpi JOIN courses c ON cpi.courseId = c.id WHERE cpi.pathId = 30001 ORDER BY cpi.`order` LIMIT 5"
  );
  console.log("\n📋 أول 5 دورات في المسار التأسيسي:");
  items.forEach(i => console.log(`  ${i.order}. ${i.title}`));

  const [lessonCheck] = await conn.query(
    "SELECT id, title FROM course_lessons WHERE courseId = 120023 ORDER BY `order`"
  );
  console.log("\n📋 دروس دورة نظام العمل:");
  lessonCheck.forEach(l => console.log(`  - ${l.title}`));

} catch (err) {
  console.error("❌ خطأ:", err.message);
} finally {
  await conn.end();
}
