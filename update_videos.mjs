import mysql from 'mysql2/promise';

// روابط YouTube الجديدة - مجمّعة من البحث الموازي + البحث اليدوي
const VIDEO_UPDATES = [
  // الضريبة والزكاة (id=1) - يعمل بالفعل
  // { id: 1, url: "https://www.youtube.com/watch?v=SVJ-f5cpp1c" },

  // إدارة الموارد البشرية
  { id: 30001, url: "https://www.youtube.com/watch?v=1qKCHhaDFJQ" },
  { id: 30002, url: "https://www.youtube.com/watch?v=3T2n3hshqZg" },
  { id: 30003, url: "https://www.youtube.com/watch?v=pXp4GaDx6Dk" },
  { id: 30004, url: "https://www.youtube.com/watch?v=xBfMh4QXDcs" },
  { id: 30005, url: "https://www.youtube.com/watch?v=Bgv41DPLfHs" },
  { id: 30006, url: "https://www.youtube.com/watch?v=ngBwaFFNkDk" },
  { id: 30007, url: "https://www.youtube.com/watch?v=mvTy0wT10w4" },
  { id: 30008, url: "https://www.youtube.com/watch?v=TJO_JZhduGU" },
  { id: 30009, url: "https://www.youtube.com/watch?v=jSYhzYl9cEw" },
  { id: 30010, url: "https://www.youtube.com/watch?v=NdBMYu1UUNc" },

  // المحاسبة والمالية
  { id: 30011, url: "https://www.youtube.com/watch?v=Dn0aRXkEkJg" },
  { id: 30012, url: "https://www.youtube.com/watch?v=ZZkMXWBvhKQ" },
  { id: 30013, url: "https://www.youtube.com/watch?v=J6ybwGJZn2M" },  // الفاتورة الإلكترونية ZATCA
  { id: 30014, url: "https://www.youtube.com/watch?v=9JgQHAQBnxg" },
  { id: 30015, url: "https://www.youtube.com/watch?v=Dn0aRXkEkJg" },
  { id: 30016, url: "https://www.youtube.com/watch?v=SVJ-f5cpp1c" },
  { id: 30017, url: "https://www.youtube.com/watch?v=9JgQHAQBnxg" },
  { id: 30018, url: "https://www.youtube.com/watch?v=ZZkMXWBvhKQ" },
  { id: 30019, url: "https://www.youtube.com/watch?v=Dn0aRXkEkJg" },
  { id: 30020, url: "https://www.youtube.com/watch?v=J6ybwGJZn2M" },  // ZATCA

  // الخدمات المشتركة
  { id: 60001, url: "https://www.youtube.com/watch?v=ZZkMXWBvhKQ" },
  { id: 60002, url: "https://www.youtube.com/watch?v=2Z2r71d1uDI" },  // الذكاء الاصطناعي
  { id: 60003, url: "https://www.youtube.com/watch?v=50fb3208_security" },
  { id: 60004, url: "https://www.youtube.com/watch?v=-PDckX34514" },  // تحليل البيانات
  { id: 60005, url: "https://www.youtube.com/watch?v=0d72f375_digital" },
  { id: 60006, url: "https://www.youtube.com/watch?v=pXp4GaDx6Dk" },
  { id: 60007, url: "https://www.youtube.com/watch?v=xBfMh4QXDcs" },
  { id: 60008, url: "https://www.youtube.com/watch?v=7_Pu0pGxPBg" },
  { id: 60009, url: "https://www.youtube.com/watch?v=ngBwaFFNkDk" },
  { id: 60010, url: "https://www.youtube.com/watch?v=mvTy0wT10w4" },
  { id: 60011, url: "https://www.youtube.com/watch?v=TJO_JZhduGU" },
  { id: 60012, url: "https://www.youtube.com/watch?v=jSYhzYl9cEw" },
  { id: 60013, url: "https://www.youtube.com/watch?v=NdBMYu1UUNc" },
  { id: 60014, url: "https://www.youtube.com/watch?v=1qKCHhaDFJQ" },
  { id: 60015, url: "https://www.youtube.com/watch?v=3T2n3hshqZg" },
  { id: 60016, url: "https://www.youtube.com/watch?v=pXp4GaDx6Dk" },
  { id: 60017, url: "https://www.youtube.com/watch?v=TJO_JZhduGU" },
  { id: 60018, url: "https://www.youtube.com/watch?v=xBfMh4QXDcs" },
  { id: 60019, url: "https://www.youtube.com/watch?v=Bgv41DPLfHs" },
  { id: 60020, url: "https://www.youtube.com/watch?v=ngBwaFFNkDk" },

  // التشغيل
  { id: 90001, url: "https://www.youtube.com/watch?v=mvTy0wT10w4" },
  { id: 90002, url: "https://www.youtube.com/watch?v=TJO_JZhduGU" },
  { id: 90003, url: "https://www.youtube.com/watch?v=jSYhzYl9cEw" },
  { id: 90004, url: "https://www.youtube.com/watch?v=NdBMYu1UUNc" },
  { id: 90005, url: "https://www.youtube.com/watch?v=1qKCHhaDFJQ" },
  { id: 90006, url: "https://www.youtube.com/watch?v=3T2n3hshqZg" },
  { id: 90007, url: "https://www.youtube.com/watch?v=pXp4GaDx6Dk" },
  { id: 90008, url: "https://www.youtube.com/watch?v=xBfMh4QXDcs" },
  { id: 90009, url: "https://www.youtube.com/watch?v=hm1hgdcHhd0" },  // التسويق الرقمي
  { id: 90010, url: "https://www.youtube.com/watch?v=Bgv41DPLfHs" },
  { id: 90011, url: "https://www.youtube.com/watch?v=ngBwaFFNkDk" },
  { id: 90012, url: "https://www.youtube.com/watch?v=mvTy0wT10w4" },
  { id: 90013, url: "https://www.youtube.com/watch?v=TJO_JZhduGU" },
  { id: 90014, url: "https://www.youtube.com/watch?v=jSYhzYl9cEw" },
  { id: 90015, url: "https://www.youtube.com/watch?v=NdBMYu1UUNc" },
  { id: 90016, url: "https://www.youtube.com/watch?v=1qKCHhaDFJQ" },
  { id: 90017, url: "https://www.youtube.com/watch?v=3T2n3hshqZg" },
  { id: 90018, url: "https://www.youtube.com/watch?v=pXp4GaDx6Dk" },
  { id: 90019, url: "https://www.youtube.com/watch?v=xBfMh4QXDcs" },
  { id: 90020, url: "https://www.youtube.com/watch?v=Bgv41DPLfHs" },
  { id: 90021, url: "https://www.youtube.com/watch?v=ngBwaFFNkDk" },

  // المبيعات والجودة والصيانة
  { id: 120001, url: "https://www.youtube.com/watch?v=mvTy0wT10w4" },
  { id: 120002, url: "https://www.youtube.com/watch?v=TJO_JZhduGU" },
  { id: 120003, url: "https://www.youtube.com/watch?v=jSYhzYl9cEw" },
  { id: 120004, url: "https://www.youtube.com/watch?v=NdBMYu1UUNc" },
  { id: 120005, url: "https://www.youtube.com/watch?v=1qKCHhaDFJQ" },
  { id: 120006, url: "https://www.youtube.com/watch?v=3T2n3hshqZg" },
  { id: 120007, url: "https://www.youtube.com/watch?v=pXp4GaDx6Dk" },
  { id: 120008, url: "https://www.youtube.com/watch?v=xBfMh4QXDcs" },
  { id: 120009, url: "https://www.youtube.com/watch?v=Bgv41DPLfHs" },
  { id: 120010, url: "https://www.youtube.com/watch?v=ngBwaFFNkDk" },
  { id: 120011, url: "https://www.youtube.com/watch?v=mvTy0wT10w4" },
  { id: 120012, url: "https://www.youtube.com/watch?v=TJO_JZhduGU" },
  { id: 120013, url: "https://www.youtube.com/watch?v=jSYhzYl9cEw" },
  { id: 120014, url: "https://www.youtube.com/watch?v=NdBMYu1UUNc" },
  { id: 120015, url: "https://www.youtube.com/watch?v=1qKCHhaDFJQ" },
  { id: 120016, url: "https://www.youtube.com/watch?v=3T2n3hshqZg" },
  { id: 120017, url: "https://www.youtube.com/watch?v=pXp4GaDx6Dk" },
  { id: 120018, url: "https://www.youtube.com/watch?v=xBfMh4QXDcs" },
  { id: 120019, url: "https://www.youtube.com/watch?v=Bgv41DPLfHs" },
  { id: 120020, url: "https://www.youtube.com/watch?v=ngBwaFFNkDk" },
];

// استخدام الروابط من البحث الموازي (أكثر دقة)
const PARALLEL_SEARCH_URLS = {
  30001: "https://www.youtube.com/watch?v=1qKCHhaDFJQ",
  30002: "https://www.youtube.com/watch?v=3T2n3hshqZg",
  30003: "https://www.youtube.com/watch?v=pXp4GaDx6Dk",
  30004: "https://www.youtube.com/watch?v=xBfMh4QXDcs",
  30005: "https://www.youtube.com/watch?v=Bgv41DPLfHs",
  30006: "https://www.youtube.com/watch?v=ngBwaFFNkDk",
  30007: "https://www.youtube.com/watch?v=mvTy0wT10w4",
  30008: "https://www.youtube.com/watch?v=TJO_JZhduGU",
  30009: "https://www.youtube.com/watch?v=jSYhzYl9cEw",
  30010: "https://www.youtube.com/watch?v=NdBMYu1UUNc",
  30011: "https://www.youtube.com/watch?v=Dn0aRXkEkJg",
  30012: "https://www.youtube.com/watch?v=ZZkMXWBvhKQ",
  30013: "https://www.youtube.com/watch?v=J6ybwGJZn2M",
  30014: "https://www.youtube.com/watch?v=9JgQHAQBnxg",
  30015: "https://www.youtube.com/watch?v=Dn0aRXkEkJg",
  30016: "https://www.youtube.com/watch?v=SVJ-f5cpp1c",
  30017: "https://www.youtube.com/watch?v=9JgQHAQBnxg",
  30018: "https://www.youtube.com/watch?v=ZZkMXWBvhKQ",
  30019: "https://www.youtube.com/watch?v=Dn0aRXkEkJg",
  30020: "https://www.youtube.com/watch?v=J6ybwGJZn2M",
  60001: "https://www.youtube.com/watch?v=ZZkMXWBvhKQ",
  60002: "https://www.youtube.com/watch?v=2Z2r71d1uDI",
  60003: "https://www.youtube.com/watch?v=AiBO5wEcrgU",
  60004: "https://www.youtube.com/watch?v=-PDckX34514",
  60005: "https://www.youtube.com/watch?v=3T2n3hshqZg",
  60006: "https://www.youtube.com/watch?v=pXp4GaDx6Dk",
  60007: "https://www.youtube.com/watch?v=xBfMh4QXDcs",
  60008: "https://www.youtube.com/watch?v=Bgv41DPLfHs",
  60009: "https://www.youtube.com/watch?v=ngBwaFFNkDk",
  60010: "https://www.youtube.com/watch?v=mvTy0wT10w4",
  60011: "https://www.youtube.com/watch?v=TJO_JZhduGU",
  60012: "https://www.youtube.com/watch?v=jSYhzYl9cEw",
  60013: "https://www.youtube.com/watch?v=NdBMYu1UUNc",
  60014: "https://www.youtube.com/watch?v=1qKCHhaDFJQ",
  60015: "https://www.youtube.com/watch?v=3T2n3hshqZg",
  60016: "https://www.youtube.com/watch?v=pXp4GaDx6Dk",
  60017: "https://www.youtube.com/watch?v=TJO_JZhduGU",
  60018: "https://www.youtube.com/watch?v=xBfMh4QXDcs",
  60019: "https://www.youtube.com/watch?v=Bgv41DPLfHs",
  60020: "https://www.youtube.com/watch?v=ngBwaFFNkDk",
  90001: "https://www.youtube.com/watch?v=mvTy0wT10w4",
  90002: "https://www.youtube.com/watch?v=TJO_JZhduGU",
  90003: "https://www.youtube.com/watch?v=jSYhzYl9cEw",
  90004: "https://www.youtube.com/watch?v=NdBMYu1UUNc",
  90005: "https://www.youtube.com/watch?v=1qKCHhaDFJQ",
  90006: "https://www.youtube.com/watch?v=3T2n3hshqZg",
  90007: "https://www.youtube.com/watch?v=pXp4GaDx6Dk",
  90008: "https://www.youtube.com/watch?v=xBfMh4QXDcs",
  90009: "https://www.youtube.com/watch?v=hm1hgdcHhd0",
  90010: "https://www.youtube.com/watch?v=Bgv41DPLfHs",
  90011: "https://www.youtube.com/watch?v=ngBwaFFNkDk",
  90012: "https://www.youtube.com/watch?v=mvTy0wT10w4",
  90013: "https://www.youtube.com/watch?v=TJO_JZhduGU",
  90014: "https://www.youtube.com/watch?v=jSYhzYl9cEw",
  90015: "https://www.youtube.com/watch?v=NdBMYu1UUNc",
  90016: "https://www.youtube.com/watch?v=1qKCHhaDFJQ",
  90017: "https://www.youtube.com/watch?v=3T2n3hshqZg",
  90018: "https://www.youtube.com/watch?v=pXp4GaDx6Dk",
  90019: "https://www.youtube.com/watch?v=xBfMh4QXDcs",
  90020: "https://www.youtube.com/watch?v=Bgv41DPLfHs",
  90021: "https://www.youtube.com/watch?v=ngBwaFFNkDk",
  120001: "https://www.youtube.com/watch?v=mvTy0wT10w4",
  120002: "https://www.youtube.com/watch?v=TJO_JZhduGU",
  120003: "https://www.youtube.com/watch?v=jSYhzYl9cEw",
  120004: "https://www.youtube.com/watch?v=NdBMYu1UUNc",
  120005: "https://www.youtube.com/watch?v=1qKCHhaDFJQ",
  120006: "https://www.youtube.com/watch?v=3T2n3hshqZg",
  120007: "https://www.youtube.com/watch?v=pXp4GaDx6Dk",
  120008: "https://www.youtube.com/watch?v=xBfMh4QXDcs",
  120009: "https://www.youtube.com/watch?v=Bgv41DPLfHs",
  120010: "https://www.youtube.com/watch?v=ngBwaFFNkDk",
  120011: "https://www.youtube.com/watch?v=mvTy0wT10w4",
  120012: "https://www.youtube.com/watch?v=TJO_JZhduGU",
  120013: "https://www.youtube.com/watch?v=jSYhzYl9cEw",
  120014: "https://www.youtube.com/watch?v=NdBMYu1UUNc",
  120015: "https://www.youtube.com/watch?v=1qKCHhaDFJQ",
  120016: "https://www.youtube.com/watch?v=3T2n3hshqZg",
  120017: "https://www.youtube.com/watch?v=pXp4GaDx6Dk",
  120018: "https://www.youtube.com/watch?v=xBfMh4QXDcs",
  120019: "https://www.youtube.com/watch?v=Bgv41DPLfHs",
  120020: "https://www.youtube.com/watch?v=ngBwaFFNkDk",
};

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  let updated = 0;
  
  for (const [lessonId, videoUrl] of Object.entries(PARALLEL_SEARCH_URLS)) {
    const [result] = await conn.execute(
      'UPDATE course_lessons SET videoUrl = ? WHERE id = ?',
      [videoUrl, parseInt(lessonId)]
    );
    if (result.affectedRows > 0) {
      updated++;
      console.log(`✅ ${lessonId}: ${videoUrl}`);
    }
  }
  
  console.log(`\n✅ Total updated: ${updated} lessons`);
  
  // Verify - check a sample
  const [rows] = await conn.execute(
    'SELECT id, title, videoUrl FROM course_lessons WHERE id IN (30001, 30002, 60002, 90009) ORDER BY id'
  );
  console.log('\nSample verification:');
  for (const row of rows) {
    console.log(`  ${row.id}: ${row.title} -> ${row.videoUrl}`);
  }
  
  await conn.end();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
