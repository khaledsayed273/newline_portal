import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
import { config } from 'dotenv';
config();

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  const exams = JSON.parse(readFileSync('/tmp/exams_generated.json', 'utf8'));
  
  let inserted = 0;
  let updated = 0;
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
      'SELECT id FROM course_exams WHERE courseId = ? LIMIT 1',
      [courseId]
    );
    
    if (existing.length > 0) {
      // Update existing exam
      await conn.execute(
        'UPDATE course_exams SET questions = ?, passingScore = 70 WHERE courseId = ?',
        [JSON.stringify(exam.questions), courseId]
      );
      console.log(`🔄 Updated: ${exam.title}`);
      updated++;
    } else {
      // Insert new exam
      await conn.execute(
        'INSERT INTO course_exams (courseId, questions, passingScore) VALUES (?, ?, 70)',
        [courseId, JSON.stringify(exam.questions)]
      );
      console.log(`✅ Inserted: ${exam.title}`);
      inserted++;
    }
  }
  
  console.log(`\n✅ Done! ${inserted} inserted, ${updated} updated, ${skipped} skipped`);
  await conn.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
