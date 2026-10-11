import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(`
  SELECT cl.id, cl.title, cl.videoUrl, c.title as courseName, c.id as courseId
  FROM course_lessons cl
  JOIN courses c ON cl.courseId = c.id
  ORDER BY c.id, cl.id
`);
console.log(JSON.stringify(rows, null, 2));
await conn.end();
