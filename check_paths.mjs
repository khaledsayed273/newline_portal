import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// جلب جميع الجداول
const [tables] = await conn.query("SHOW TABLES");
console.log("Tables:", tables.map(t => Object.values(t)[0]));

// جلب المسارات
try {
  const [paths] = await conn.query("SELECT id, title, department_id FROM paths ORDER BY id LIMIT 20");
  console.log("\nPaths:", JSON.stringify(paths, null, 2));
} catch(e) {
  console.log("paths table error:", e.message);
}

// جلب الدورات
try {
  const [courses] = await conn.query("SELECT id, title, path_id, department_id FROM courses ORDER BY id LIMIT 20");
  console.log("\nCourses:", JSON.stringify(courses, null, 2));
} catch(e) {
  console.log("courses table error:", e.message);
}

await conn.end();
