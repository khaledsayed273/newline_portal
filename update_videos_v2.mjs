import mysql from 'mysql2/promise';

// خريطة courseId -> videoUrl المتخصص
const COURSE_VIDEO_MAP = {
  // موارد بشرية (30001-30010)
  30001: "https://www.youtube.com/watch?v=1qKCHhaDFJQ",  // أساسيات إدارة الموارد البشرية
  30002: "https://www.youtube.com/watch?v=NdBMYu1UUNc",  // نظام العمل السعودي
  30003: "https://www.youtube.com/watch?v=pXp4GaDx6Dk",  // إدارة الأداء
  30004: "https://www.youtube.com/watch?v=xBfMh4QXDcs",  // التوظيف والاستقطاب
  30005: "https://www.youtube.com/watch?v=Bgv41DPLfHs",  // إدارة الرواتب
  30006: "https://www.youtube.com/watch?v=ngBwaFFNkDk",  // الاحتفاظ بالموظفين
  30007: "https://www.youtube.com/watch?v=mvTy0wT10w4",  // بناء ثقافة مؤسسية
  30008: "https://www.youtube.com/watch?v=TJO_JZhduGU",  // التدريب وتطوير الكفاءات
  30009: "https://www.youtube.com/watch?v=jSYhzYl9cEw",  // إدارة الموارد البشرية الاستراتيجية
  30010: "https://www.youtube.com/watch?v=NdBMYu1UUNc",  // التوافق مع أنظمة العمل

  // مالية/محاسبة (30011-30020)
  30011: "https://www.youtube.com/watch?v=IQyRSzI0Bvs",  // أساسيات المحاسبة
  30012: "https://www.youtube.com/watch?v=GXNWpOz_YJM",  // الضريبة على القيمة المضافة
  30013: "https://www.youtube.com/watch?v=no4KdyezjD4",  // الفاتورة الإلكترونية
  30014: "https://www.youtube.com/watch?v=4Go_NsrsVDw",  // إدارة التدفق النقدي
  30015: "https://www.youtube.com/watch?v=qdb8YcfjdZ4",  // القوائم المالية
  30016: "https://www.youtube.com/watch?v=UA5Pl6JO4Hc",  // الزكاة وكيفية احتسابها
  30017: "https://www.youtube.com/watch?v=XEx59SuUWo0",  // إدارة الحسابات الدائنة والمدينة
  30018: "https://www.youtube.com/watch?v=vIuvr060cPc",  // التخطيط المالي والميزانية
  30019: "https://www.youtube.com/watch?v=4ex6PVR06mg",  // التدقيق الداخلي
  30020: "https://www.youtube.com/watch?v=kYNWmKQWQIo",  // ZATCA

  // خدمات مشتركة (60001-60020)
  60001: "https://www.youtube.com/watch?v=DtpU3zxVSRI",  // إدارة الأصول الثابتة
  60002: "https://www.youtube.com/watch?v=AiBO5wEcrgU",  // الذكاء الاصطناعي
  60003: "https://www.youtube.com/watch?v=6lkcwmvyjSQ",  // أمن المعلومات
  60004: "https://www.youtube.com/watch?v=-PDckX34514",  // تحليل البيانات
  60005: "https://www.youtube.com/watch?v=C2y_YnHENec",  // التحول الرقمي
  60006: "https://www.youtube.com/watch?v=_8sjUN7oWVc",  // مهارات التواصل
  60007: "https://www.youtube.com/watch?v=qTqN29km6lI",  // إدارة الوقت
  60008: "https://www.youtube.com/watch?v=C4hONMmg5qY",  // مهارات العرض
  60009: "https://www.youtube.com/watch?v=m3SbfZJr5ig",  // التفكير النقدي
  60010: "https://www.youtube.com/watch?v=DXUDqOwy2MQ",  // العمل ضمن الفريق
  60011: "https://www.youtube.com/watch?v=vsczI0CpvbQ",  // خدمة العملاء
  60012: "https://www.youtube.com/watch?v=S1t5x0stdbo",  // مهارات التفاوض
  60013: "https://www.youtube.com/watch?v=k1K5OAmZnag",  // القيادة وإدارة الفرق
  60014: "https://www.youtube.com/watch?v=kcS2lNhJggo",  // مبادئ إدارة المشتريات
  60015: "https://www.youtube.com/watch?v=zK4RRUqJqqg",  // التخطيط الاستراتيجي
  60016: "https://www.youtube.com/watch?v=hP047Jd1dwE",  // إدارة التغيير
  60017: "https://www.youtube.com/watch?v=4TEjiFRcYCw",  // مهارات التدريب
  60018: "https://www.youtube.com/watch?v=CmUOXhW1YdY",  // إدارة المخزون
  60019: "https://www.youtube.com/watch?v=wDwkeoqtijc",  // التخطيط والجدولة في اللوجستيات
  60020: "https://www.youtube.com/watch?v=GJwWkfzS8zI",  // إدارة علاقات الموردين

  // تشغيل/لوجستيات (90001-90021)
  90001: "https://www.youtube.com/watch?v=vluCOd_r8js",  // مبادئ اللوجستيات
  90002: "https://www.youtube.com/watch?v=PDEGJYSxLHM",  // إدارة سلسلة التوريد
  90003: "https://www.youtube.com/watch?v=WcDeh7K5fFk",  // أساسيات إدارة المستودعات
  90004: "https://www.youtube.com/watch?v=NLqm0LP9JYU",  // السلامة المرورية
  90005: "https://www.youtube.com/watch?v=Pexs2nhJeLU",  // أنظمة التبريد والتجميد
  90006: "https://www.youtube.com/watch?v=ggLgd115xHI",  // صيانة المركبات الثقيلة
  90007: "https://www.youtube.com/watch?v=iTyCk9YUzQQ",  // إدارة الأسطول
  90008: "https://www.youtube.com/watch?v=TuDfcQSGuSs",  // القيادة الدفاعية
  90009: "https://www.youtube.com/watch?v=STbhc0Rvzao",  // التسويق الرقمي
  90010: "https://www.youtube.com/watch?v=issSttVH-Eg",  // مهارات البيع
  90011: "https://www.youtube.com/watch?v=G_Vo9V6HEDA",  // تقنيات التبريد الصناعي
  90012: "https://www.youtube.com/watch?v=UcqnZnFnz8I",  // إدارة الكهرباء
  90013: "https://www.youtube.com/watch?v=FfIH6jTBWPE",  // الصيانة الوقائية للمركبات
  90014: "https://www.youtube.com/watch?v=hTyI6c91W4M",  // نظام GPS
  90015: "https://www.youtube.com/watch?v=ZcgwONmcr_Q",  // إدارة المخاطر في اللوجستيات
  90016: "https://www.youtube.com/watch?v=l98bcS_wMK0",  // السلامة في المستودعات
  90017: "https://www.youtube.com/watch?v=AWSWQEZCO-k",  // إدارة الطوارئ والأزمات
  90018: "https://www.youtube.com/watch?v=q-1T5SWcGfI",  // السلامة في نقل البضائع الخطرة
  90019: "https://www.youtube.com/watch?v=pJ9egSKi0oQ",  // الإسعافات الأولية
  90020: "https://www.youtube.com/watch?v=fDiDKQsMIUM",  // إدارة سلسلة الإمداد في الأزمات
  90021: "https://www.youtube.com/watch?v=jdUfkxl68iQ",  // أمن المستودعات

  // جودة/مبيعات/صيانة (120001-120020)
  120001: "https://www.youtube.com/watch?v=XW308qCDNRI",  // ISO 9001
  120002: "https://www.youtube.com/watch?v=3T2n3hshqZg",  // Lean
  120003: "https://www.youtube.com/watch?v=pXp4GaDx6Dk",  // Six Sigma
  120004: "https://www.youtube.com/watch?v=xBfMh4QXDcs",  // KPI
  120005: "https://www.youtube.com/watch?v=4ex6PVR06mg",  // التدقيق الداخلي للجودة
  120006: "https://www.youtube.com/watch?v=vsczI0CpvbQ",  // إدارة شكاوى العملاء
  120007: "https://www.youtube.com/watch?v=S1t5x0stdbo",  // استراتيجيات التسعير
  120008: "https://www.youtube.com/watch?v=k1K5OAmZnag",  // CRM
  120009: "https://www.youtube.com/watch?v=zK4RRUqJqqg",  // تحليل السوق
  120010: "https://www.youtube.com/watch?v=kcS2lNhJggo",  // إدارة المناقصات
  120011: "https://www.youtube.com/watch?v=GJwWkfzS8zI",  // إدارة العقود التجارية
  120012: "https://www.youtube.com/watch?v=ggLgd115xHI",  // أسس الصيانة الصناعية
  120013: "https://www.youtube.com/watch?v=CmUOXhW1YdY",  // إدارة قطع الغيار
  120014: "https://www.youtube.com/watch?v=Pexs2nhJeLU",  // صيانة أنظمة التبريد المتقدمة
  120015: "https://www.youtube.com/watch?v=FfIH6jTBWPE",  // تشخيص أعطال المركبات
  120016: "https://www.youtube.com/watch?v=l98bcS_wMK0",  // السلامة المهنية في ورش الصيانة
  120017: "https://www.youtube.com/watch?v=iTyCk9YUzQQ",  // إدارة الأصول والمعدات
  120018: "https://www.youtube.com/watch?v=hTyI6c91W4M",  // أنظمة التتبع والمراقبة
  120019: "https://www.youtube.com/watch?v=ZcgwONmcr_Q",  // تحليل بيانات الأداء التشغيلي
  120020: "https://www.youtube.com/watch?v=wDwkeoqtijc",  // إدارة تكاليف النقل
};

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  let updated = 0;
  
  for (const [courseId, videoUrl] of Object.entries(COURSE_VIDEO_MAP)) {
    // تحديث جميع الدروس في هذه الدورة
    const [result] = await conn.execute(
      'UPDATE course_lessons SET videoUrl = ? WHERE courseId = ?',
      [videoUrl, parseInt(courseId)]
    );
    if (result.affectedRows > 0) {
      updated += result.affectedRows;
      console.log(`✅ courseId=${courseId}: ${result.affectedRows} lessons -> ${videoUrl}`);
    } else {
      console.log(`⚠️  courseId=${courseId}: no lessons found`);
    }
  }
  
  console.log(`\n✅ Total updated: ${updated} lessons`);
  
  // التحقق من عينة
  const [rows] = await conn.execute(
    'SELECT cl.id, cl.title, cl.videoUrl, c.title as courseName FROM course_lessons cl JOIN courses c ON cl.courseId = c.id WHERE cl.courseId IN (30011, 30016, 90001, 90009, 120001, 120008) ORDER BY cl.courseId LIMIT 10'
  );
  console.log('\nSample verification:');
  for (const row of rows) {
    console.log(`  [${row.id}] ${row.courseName} -> ${row.videoUrl}`);
  }
  
  await conn.end();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
