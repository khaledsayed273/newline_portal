import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// هيكل course_paths
const [cp] = await conn.query("DESCRIBE course_paths");
console.log("course_paths columns:", cp.map(r => r.Field));

// هيكل courses
const [c] = await conn.query("DESCRIBE courses");
console.log("courses columns:", c.map(r => r.Field));

// هيكل course_path_items
const [cpi] = await conn.query("DESCRIBE course_path_items");
console.log("course_path_items columns:", cpi.map(r => r.Field));

// جلب course_paths
const [paths] = await conn.query("SELECT * FROM course_paths ORDER BY id LIMIT 10");
console.log("\ncourse_paths data:", JSON.stringify(paths, null, 2));

// جلب الدورات
const [courses] = await conn.query("SELECT id, title, department_id FROM courses ORDER BY id");
console.log("\ncourses:", JSON.stringify(courses, null, 2));

await conn.end();
