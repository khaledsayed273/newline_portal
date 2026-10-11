import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // 1. فحص مسارات قسم المبيعات (departmentId=3)
  const [salesPaths] = await conn.query(
    "SELECT id, name FROM course_paths WHERE departmentId = 3 ORDER BY id"
  );
  console.log("Sales paths:", JSON.stringify(salesPaths));

  // 2. فحص الدورات الموجودة في قسم المبيعات (departmentId=3)
  const [salesCourses] = await conn.query(
    "SELECT id, title FROM courses WHERE departmentId = 3 ORDER BY id LIMIT 5"
  );
  console.log("Sales courses:", JSON.stringify(salesCourses));

  // 3. إضافة الدورة الجديدة
  const courseId = 120030;
  const [existing] = await conn.query("SELECT id FROM courses WHERE id = ?", [courseId]);
  if (existing.length > 0) {
    console.log("⚠️ الدورة موجودة بالفعل");
  } else {
    await conn.execute(
      "INSERT INTO courses (id, title, description, departmentId, thumbnailUrl, duration, level, isPublished, `order`, createdAt, updatedAt) VALUES (?, ?, ?, ?, NULL, NULL, 'beginner', 1, 1, NOW(), NOW())",
      [
        courseId,
        "المبيعات بأن لا تجلب مبيعات",
        "دورة تدريبية متخصصة تكشف أسرار المبيعات الفعّالة وكيف تتجنب الأخطاء الشائعة التي تعيق تحقيق الأهداف البيعية.",
        3, // departmentId = المبيعات
      ]
    );
    console.log("✅ تم إضافة الدورة (ID:", courseId, ")");
  }

  // 4. إضافة درس YouTube واحد
  const lessonId = 120031;
  const [existingLesson] = await conn.query("SELECT id FROM course_lessons WHERE id = ?", [lessonId]);
  if (existingLesson.length > 0) {
    console.log("⚠️ الدرس موجود بالفعل");
  } else {
    await conn.execute(
      "INSERT INTO course_lessons (id, courseId, title, description, videoUrl, videoType, duration, `order`, isPublished, createdAt) VALUES (?, ?, ?, ?, ?, 'youtube', NULL, 1, 1, NOW())",
      [
        lessonId,
        courseId,
        "المبيعات بأن لا تجلب مبيعات",
        "الدرس الرئيسي للدورة - فيديو YouTube",
        "https://youtu.be/jiCezbNBNQE?si=UzUn0snufborTNri",
      ]
    );
    console.log("✅ تم إضافة الدرس (ID:", lessonId, ")");
  }

  // 5. ربط الدورة بالمسار الأول للمبيعات (إن وجد)
  if (salesPaths.length > 0) {
    const salesPathId = salesPaths[0].id;
    const [existingItem] = await conn.query(
      "SELECT id FROM course_path_items WHERE courseId = ? AND pathId = ?",
      [courseId, salesPathId]
    );
    if (existingItem.length > 0) {
      console.log("⚠️ الدورة مرتبطة بالمسار بالفعل");
    } else {
      // إيجاد أعلى ترتيب في المسار
      const [maxOrder] = await conn.query(
        "SELECT MAX(`order`) as maxOrd FROM course_path_items WHERE pathId = ?",
        [salesPathId]
      );
      const newOrder = (maxOrder[0].maxOrd ?? 0) + 1;
      await conn.execute(
        "INSERT INTO course_path_items (pathId, courseId, `order`) VALUES (?, ?, ?)",
        [salesPathId, courseId, newOrder]
      );
      console.log("✅ تم ربط الدورة بمسار المبيعات (pathId:", salesPathId, ", order:", newOrder, ")");
    }
  } else {
    console.log("⚠️ لا يوجد مسار للمبيعات - الدورة أُضيفت للقسم مباشرة");
  }

  // التحقق النهائي
  const [check] = await conn.query(
    "SELECT c.id, c.title, c.departmentId FROM courses c WHERE c.id = ?",
    [courseId]
  );
  console.log("\n📋 الدورة المضافة:", JSON.stringify(check));

} catch (err) {
  console.error("❌ خطأ:", err.message);
} finally {
  await conn.end();
}
