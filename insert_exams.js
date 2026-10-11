const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  const exams = JSON.parse(fs.readFileSync('/tmp/exams_generated.json', 'utf8'));
  
  let inserted = 0;
  let skipped = 0;
  
  for (const exam of exams) {
    if (!exam.success || !exam.questions || exam.questions.length === 0) {
      console.log(`⚠️  Skipping ${exam.title} (no questions)`);
      skipped++;
      continue;
    }
    
    const courseId = exam.courseId;
    
    // Check if exam already exists
    const [existing] = await conn.execute(
      'SELECT id FROM course_exams WHERE course_id = ? LIMIT 1',
      [courseId]
    );
    
    if (existing.length > 0) {
      // Update existing exam
      await conn.execute(
        'UPDATE course_exams SET questions = ?, pass_score = 70, total_score = 100 WHERE course_id = ?',
        [JSON.stringify(exam.questions), courseId]
      );
      console.log(`🔄 Updated: ${exam.title}`);
    } else {
      // Insert new exam
      await conn.execute(
        'INSERT INTO course_exams (course_id, questions, pass_score, total_score) VALUES (?, ?, 70, 100)',
        [courseId, JSON.stringify(exam.questions)]
      );
      console.log(`✅ Inserted: ${exam.title}`);
    }
    inserted++;
  }
  
  console.log(`\n✅ Done! ${inserted} exams inserted/updated, ${skipped} skipped`);
  await conn.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
