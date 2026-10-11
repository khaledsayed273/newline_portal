import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// جلب course_paths (المسارات)
const [paths] = await conn.query("SELECT id, title, department_id FROM course_paths ORDER BY id");
console.log("course_paths:", JSON.stringify(paths, null, 2));

// جلب الأقسام
const [depts] = await conn.query("SELECT id, name FROM departments ORDER BY id");
console.log("\ndepartments:", JSON.stringify(depts, null, 2));

// جلب الدورات مع مسارها
const [courses] = await conn.query("SELECT id, title, department_id FROM courses ORDER BY id");
console.log("\ncourses:", JSON.stringify(courses, null, 2));

// جلب course_path_items
const [items] = await conn.query("SELECT path_id, course_id, order_index FROM course_path_items ORDER BY path_id, order_index LIMIT 30");
console.log("\ncourse_path_items (first 30):", JSON.stringify(items, null, 2));

await conn.end();
