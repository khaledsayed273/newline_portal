import mysql from 'mysql2/promise';

const videos = [
  {"id":89,"title":"دورة الحملة النموذجية","videoId":"813732c5-e20d-4de3-afb0-617f229f603f","target":"supervisor"},
  {"id":88,"title":"FleetFlow Operation 001","videoId":"0d72f375-6c2f-427d-a334-04260d387025","target":"supervisor"},
  {"id":87,"title":"FleetFlow Sales 001","videoId":"be72d8c5-56fb-4474-b682-b86674297004","target":"supervisor"},
  {"id":84,"title":"اللغة الانجليزية 1 (مبادرة تحسين)","videoId":"d014315d-c216-433a-8b75-e4bb959401de","target":"supervisor"},
  {"id":83,"title":"دورة تسجيل الحركة","videoId":"e3473ccb-6869-4f32-bc56-d0de93fa0d56","target":"supervisor"},
  {"id":82,"title":"دورة إصدار وثيقة النقل","videoId":"d31675b5-29f9-4a4e-85b3-6ccb43311a86","target":"supervisor"},
  {"id":54,"title":"کیف معالجة الطلب - اودو","videoId":"87033ec3-226b-4421-a4bb-53d2c53e3f05","target":"supervisor"},
  {"id":53,"title":"دورة الانهاء في المواد الصحيحة","videoId":"d19812d8-64de-4a53-b8a0-1e4dfcc3e70a","target":"supervisor"},
  {"id":52,"title":"التحليل و الرقابة المالية","videoId":"137b18d0-3796-49f2-8e45-fed63491a1dc","target":"supervisor"},
  {"id":51,"title":"اجراءات الاستقالة في النظام الجديد","videoId":"9672fcc8-a796-4ce2-8179-92f03b7b2fb2","target":"supervisor"},
  {"id":50,"title":"ورشة التحقيق العمالي","videoId":"cac1b819-6313-4c10-8a0d-d2c3ceb51917","target":"supervisor"},
  {"id":49,"title":"ورشة تفاعلية التدقيق المحاسبي","videoId":"c59657d9-c6eb-486a-bfd5-5341987b0a2b","target":"supervisor"},
  {"id":48,"title":"خدمة العملاء","videoId":"8fad6779-64ba-4657-926a-8ddc10cb1887","target":"supervisor"},
  {"id":47,"title":"براند لينكدان","videoId":"d66a2458-9a39-4ff8-87a7-848d423fe55c","target":"supervisor"},
  {"id":46,"title":"ندوة-نظام-العمل-02","videoId":"41a6a8dd-6ad5-4b9d-8511-c38e49c5dcfc","target":"supervisor"},
  {"id":45,"title":"ندوة-نظام-العمل-01","videoId":"7c446eb2-4d9c-4925-8223-f98e5addb2e3","target":"supervisor"},
  {"id":37,"title":"ادارة ضغوط العمل","videoId":"c0f7ab11-536e-4fcb-8bb7-4ac77eee1227","target":"supervisor"},
  {"id":36,"title":"مهارات الاتصال والتواصل","videoId":"139b6304-3c1f-4114-bb9d-6ce1231e9364","target":"supervisor"},
  {"id":35,"title":"التعامل مع الازمات والمخاطر HR 001","videoId":"5d74ec66-d641-494e-bde6-5103873f5314","target":"supervisor"},
  {"id":34,"title":"التدريب على المبيعات والتشغيل - 001","videoId":"f5c89f88-bb75-43bb-8946-f459fae76bde","target":"supervisor"},
  {"id":33,"title":"سجل التعثرات - 08","videoId":"b2a8a2ee-e9af-493e-88c6-03e3ddfd40fc","target":"supervisor"},
  {"id":32,"title":"سجل التعثرات - 07","videoId":"e91c92ed-e46c-41be-bad5-cbdef9bec33d","target":"supervisor"},
  {"id":31,"title":"سجل التعثرات - 06","videoId":"5a4dcfa0-56a9-4677-b5c3-ffbc1842ca2c","target":"supervisor"},
  {"id":30,"title":"سجل التعثرات - 05","videoId":"9f114289-1e27-4d24-af8a-88cf45cd1a0d","target":"supervisor"},
  {"id":29,"title":"سجل التعثرات - 04","videoId":"63088ed7-99a9-40a6-b686-bddfd44c1dbe","target":"supervisor"},
  {"id":28,"title":"سجل التعثرات - 03","videoId":"729de54f-3020-49b7-afc4-6f05916e9250","target":"supervisor"},
  {"id":27,"title":"سجل التعثرات - 02","videoId":"231477e5-f7e3-40bb-a8a4-50edf4335feb","target":"supervisor"},
  {"id":26,"title":"سجل التعثرات - 01","videoId":"9894c192-25d6-41b2-b67b-6a5f013b4034","target":"supervisor"},
  {"id":25,"title":"التنسيق بين المالية والموارد البشرية","videoId":"a62729cf-7167-4ffe-a2b5-8f937fad13b8","target":"supervisor"},
  {"id":22,"title":"سياسة الجودة","videoId":"50fb3208-04f1-46a1-97a5-4558513a06a2","target":"supervisor"},
  {"id":2,"title":"اجتماع حسابات و تشغیل","videoId":"cab5c9d0-51a9-4bd2-b435-04f3c2d255f9","target":"supervisor"},
  {"id":1,"title":"دورة خدمة العملاء","videoId":"3a63bac8-49ea-4ab3-8c94-a8d2ab34f5c6","target":"supervisor"},
  {"id":24,"title":"تدريب السائقين المدرب فيصل","videoId":"948566b1-3eda-40f8-9f56-760f0a772032","target":"driver"},
  {"id":23,"title":"دلیل السایقین","videoId":"496ddf3c-5d53-401d-be14-f64b786dab91","target":"driver"}
];

const LIBRARY_ID = '281626';

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  // جلب جميع الدروس
  const [lessons] = await conn.execute('SELECT id, courseId, title, videoUrl, videoType FROM course_lessons');
  console.log(`Total lessons: ${lessons.length}`);
  
  // جلب جميع الدورات
  const [courses] = await conn.execute('SELECT id, title FROM courses');
  console.log(`Total courses: ${courses.length}`);
  
  // مطابقة الفيديوهات مع الدورات/الدروس بناءً على التشابه في العنوان
  let updated = 0;
  
  for (const video of videos) {
    // البحث عن درس مطابق بالعنوان
    const matchingLesson = lessons.find(l => {
      const lessonTitle = l.title.toLowerCase().trim();
      const videoTitle = video.title.toLowerCase().trim();
      return lessonTitle.includes(videoTitle.substring(0, 10)) || 
             videoTitle.includes(lessonTitle.substring(0, 10)) ||
             lessonTitle === videoTitle;
    });
    
    if (matchingLesson) {
      const bunnyUrl = `bunny:${LIBRARY_ID}:${video.videoId}`;
      await conn.execute(
        'UPDATE course_lessons SET videoUrl = ?, videoType = ? WHERE id = ?',
        [bunnyUrl, 'embed', matchingLesson.id]
      );
      console.log(`✓ Matched: "${video.title}" → lesson ${matchingLesson.id} (${matchingLesson.title})`);
      updated++;
    } else {
      console.log(`✗ No match for: "${video.title}"`);
    }
  }
  
  console.log(`\nUpdated ${updated}/${videos.length} videos`);
  
  // عرض الدروس التي لم تُحدَّث
  const [unmatched] = await conn.execute(
    "SELECT id, courseId, title, videoUrl FROM course_lessons WHERE videoUrl NOT LIKE 'bunny:%' LIMIT 20"
  );
  console.log(`\nUnmatched lessons (${unmatched.length}):`);
  unmatched.forEach(l => console.log(`  - [${l.id}] ${l.title}: ${l.videoUrl?.substring(0, 50)}`));
  
  await conn.end();
}

main().catch(console.error);
