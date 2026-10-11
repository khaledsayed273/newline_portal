import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// 1. جلب الدورات الموجودة في المسار التأسيسي (30001) لمعرفة الترتيب
const [existingItems] = await conn.query(
  "SELECT cpi.courseId, c.title, cpi.order FROM course_path_items cpi JOIN courses c ON cpi.courseId = c.id WHERE cpi.pathId = 30001 ORDER BY cpi.order"
);
console.log("Existing courses in path 30001:", JSON.stringify(existingItems, null, 2));

// 2. جلب أعلى course id موجود لتحديد الـ id الجديد
const [maxCourse] = await conn.query("SELECT MAX(id) as maxId FROM courses");
const newCourseId = maxCourse[0].maxId + 1;
console.log("New course ID:", newCourseId);

// 3. إضافة الدورة الجديدة
await conn.query(
  `INSERT INTO courses (id, title, description, departmentId, thumbnailUrl, duration, level, isPublished, \`order\`, createdAt, updatedAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
  [
    newCourseId,
    "دورة الموارد البشرية",
    "دورة شاملة في إدارة الموارد البشرية تغطي المفاهيم الأساسية والتطبيقية في مجال الموارد البشرية",
    1, // departmentId = الخدمات المشتركة
    "", // thumbnailUrl
    60, // duration in minutes
    "beginner",
    1, // isPublished
    1, // order
  ]
);
console.log("✅ Course added with ID:", newCourseId);

// 4. جلب أعلى lesson id
const [maxLesson] = await conn.query("SELECT MAX(id) as maxId FROM course_lessons");
const newLessonId = maxLesson[0].maxId + 1;
console.log("New lesson ID:", newLessonId);

// 5. إضافة درس واحد مرتبط بالفيديو
await conn.query(
  `INSERT INTO course_lessons (id, courseId, title, videoUrl, videoType, duration, \`order\`, isPublished, createdAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
  [
    newLessonId,
    newCourseId,
    "مقدمة في إدارة الموارد البشرية",
    "https://www.youtube.com/watch?v=Cu2w-1O2S8I",
    "youtube",
    60,
    1,
    1,
  ]
);
console.log("✅ Lesson added with ID:", newLessonId);

// 6. ربط الدورة بالمسار التأسيسي (30001) في أول موضع
await conn.query(
  "INSERT INTO course_path_items (pathId, courseId, \`order\`) VALUES (?, ?, ?)",
  [30001, newCourseId, 1]
);
console.log("✅ Course linked to path 30001 at order 1");

// 7. تحديث ترتيب الدورات الأخرى في المسار (+1)
await conn.query(
  "UPDATE course_path_items SET `order` = `order` + 1 WHERE pathId = 30001 AND courseId != ?",
  [newCourseId]
);
console.log("✅ Updated order of existing courses");

// التحقق النهائي
const [finalItems] = await conn.query(
  "SELECT cpi.courseId, c.title, cpi.order FROM course_path_items cpi JOIN courses c ON cpi.courseId = c.id WHERE cpi.pathId = 30001 ORDER BY cpi.order"
);
console.log("\nFinal courses in path 30001:", JSON.stringify(finalItems, null, 2));

await conn.end();
