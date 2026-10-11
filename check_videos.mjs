import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [all] = await conn.execute('SELECT id, title, videoUrl, videoType FROM course_lessons ORDER BY id');

const bunny = all.filter(l => l.videoUrl && l.videoUrl.startsWith('bunny:'));
const youtube = all.filter(l => l.videoUrl && (l.videoUrl.includes('youtube') || l.videoUrl.includes('youtu.be')));
const other = all.filter(l => l.videoUrl && !l.videoUrl.startsWith('bunny:') && !l.videoUrl.includes('youtube') && !l.videoUrl.includes('youtu.be'));
const empty = all.filter(l => !l.videoUrl);

console.log('Total:', all.length);
console.log('Bunny (tasheel):', bunny.length);
console.log('YouTube:', youtube.length);
console.log('Other:', other.length);
console.log('Empty:', empty.length);

if (youtube.length > 0) {
  console.log('\nYouTube samples:');
  youtube.slice(0, 5).forEach(l => console.log(`  [${l.id}] ${l.title}: ${l.videoUrl}`));
}

if (other.length > 0) {
  console.log('\nOther samples:');
  other.slice(0, 5).forEach(l => console.log(`  [${l.id}] ${l.title}: ${l.videoUrl}`));
}

// الدروس التي ليست bunny
const nonBunny = all.filter(l => !l.videoUrl || !l.videoUrl.startsWith('bunny:'));
console.log('\nNon-Bunny lessons:');
nonBunny.forEach(l => console.log(`  [${l.id}] ${l.title}: ${l.videoUrl || 'EMPTY'}`));

await conn.end();
