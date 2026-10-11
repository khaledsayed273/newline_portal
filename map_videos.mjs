import mysql from 'mysql2/promise';

// الربط الموضوعي: lessonId -> videoId من Bunny
// كل درس يحصل على الفيديو الأنسب له من tasheel
const LIBRARY_ID = '281626';

const videoMapping = [
  // الفيديوهات المتاحة من tasheel مع الدروس المناسبة لها
  // HR path (30001-30010)
  { lessonId: 30001, videoId: '3a63bac8-49ea-4ab3-8c94-a8d2ab34f5c6', title: 'أساسيات إدارة الموارد البشرية' }, // دورة خدمة العملاء
  { lessonId: 30002, videoId: '7c446eb2-4d9c-4925-8223-f98e5addb2e3', title: 'نظام العمل السعودي 2024' }, // ندوة نظام العمل 01
  { lessonId: 30003, videoId: 'cac1b819-6313-4c10-8a0d-d2c3ceb51917', title: 'إدارة الأداء وتقييم الموظفين' }, // ورشة التحقيق العمالي
  { lessonId: 30004, videoId: 'c0f7ab11-536e-4fcb-8bb7-4ac77eee1227', title: 'التوظيف والاستقطاب الفعال' }, // ادارة ضغوط العمل
  { lessonId: 30005, videoId: '9672fcc8-a796-4ce2-8179-92f03b7b2fb2', title: 'إدارة الرواتب والمزايا' }, // اجراءات الاستقالة
  { lessonId: 30006, videoId: '139b6304-3c1f-4114-bb9d-6ce1231e9364', title: 'الاحتفاظ بالموظفين' }, // مهارات الاتصال والتواصل
  { lessonId: 30007, videoId: '5d74ec66-d641-494e-bde6-5103873f5314', title: 'بناء ثقافة مؤسسية إيجابية' }, // التعامل مع الازمات
  { lessonId: 30008, videoId: '41a6a8dd-6ad5-4b9d-8511-c38e49c5dcfc', title: 'التدريب وتطوير الكفاءات' }, // ندوة نظام العمل 02
  { lessonId: 30009, videoId: 'd66a2458-9a39-4ff8-87a7-848d423fe55c', title: 'إدارة الموارد البشرية الاستراتيجية' }, // براند لينكدان
  { lessonId: 30010, videoId: '41a6a8dd-6ad5-4b9d-8511-c38e49c5dcfc', title: 'التوافق مع أنظمة العمل السعودية' }, // ندوة نظام العمل 02

  // Finance path (30011-30020)
  { lessonId: 30011, videoId: 'cab5c9d0-51a9-4bd2-b435-04f3c2d255f9', title: 'أساسيات المحاسبة المالية' }, // اجتماع حسابات
  { lessonId: 30012, videoId: 'a62729cf-7167-4ffe-a2b5-8f937fad13b8', title: 'الضريبة على القيمة المضافة' }, // التنسيق بين المالية والموارد البشرية
  { lessonId: 30013, videoId: '87033ec3-226b-4421-a4bb-53d2c53e3f05', title: 'الفاتورة الإلكترونية' }, // کیف معالجة الطلب - اودو
  { lessonId: 30014, videoId: '137b18d0-3796-49f2-8e45-fed63491a1dc', title: 'إدارة التدفق النقدي' }, // التحليل و الرقابة المالية
  { lessonId: 30015, videoId: 'cab5c9d0-51a9-4bd2-b435-04f3c2d255f9', title: 'القوائم المالية' }, // اجتماع حسابات
  { lessonId: 30016, videoId: 'a62729cf-7167-4ffe-a2b5-8f937fad13b8', title: 'الزكاة وكيفية احتسابها' }, // التنسيق بين المالية
  { lessonId: 30017, videoId: '137b18d0-3796-49f2-8e45-fed63491a1dc', title: 'إدارة الحسابات الدائنة والمدينة' }, // التحليل و الرقابة المالية
  { lessonId: 30018, videoId: 'cab5c9d0-51a9-4bd2-b435-04f3c2d255f9', title: 'التخطيط المالي والميزانية' }, // اجتماع حسابات
  { lessonId: 30019, videoId: 'c59657d9-c6eb-486a-bfd5-5341987b0a2b', title: 'التدقيق الداخلي وضبط الجودة' }, // ورشة تفاعلية التدقيق المحاسبي
  { lessonId: 30020, videoId: '87033ec3-226b-4421-a4bb-53d2c53e3f05', title: 'نظام فاتورة الزكاة والضريبة ZATCA' }, // کیف معالجة الطلب - اودو

  // Shared Services path (60001-60020)
  { lessonId: 60001, videoId: 'd19812d8-64de-4a53-b8a0-1e4dfcc3e70a', title: 'إدارة الأصول الثابتة' }, // دورة الانهاء في المواد الصحيحة
  { lessonId: 60002, videoId: 'be72d8c5-56fb-4474-b682-b86674297004', title: 'مقدمة في الذكاء الاصطناعي' }, // FleetFlow Sales 001
  { lessonId: 60003, videoId: '50fb3208-04f1-46a1-97a5-4558513a06a2', title: 'أمن المعلومات والخصوصية' }, // سياسة الجودة
  { lessonId: 60004, videoId: '137b18d0-3796-49f2-8e45-fed63491a1dc', title: 'تحليل البيانات للمبتدئين' }, // التحليل و الرقابة المالية
  { lessonId: 60005, videoId: '0d72f375-6c2f-427d-a334-04260d387025', title: 'التحول الرقمي في المؤسسات' }, // FleetFlow Operation 001
  { lessonId: 60006, videoId: '139b6304-3c1f-4114-bb9d-6ce1231e9364', title: 'مهارات التواصل الفعال' }, // مهارات الاتصال والتواصل
  { lessonId: 60007, videoId: 'c0f7ab11-536e-4fcb-8bb7-4ac77eee1227', title: 'إدارة الوقت والإنتاجية' }, // ادارة ضغوط العمل
  { lessonId: 60008, videoId: '8fad6779-64ba-4657-926a-8ddc10cb1887', title: 'مهارات العرض والتقديم' }, // خدمة العملاء
  { lessonId: 60009, videoId: '5d74ec66-d641-494e-bde6-5103873f5314', title: 'التفكير النقدي وحل المشكلات' }, // التعامل مع الازمات والمخاطر
  { lessonId: 60010, videoId: '139b6304-3c1f-4114-bb9d-6ce1231e9364', title: 'العمل ضمن الفريق وبناء الثقة' }, // مهارات الاتصال والتواصل
  { lessonId: 60011, videoId: '8fad6779-64ba-4657-926a-8ddc10cb1887', title: 'خدمة العملاء الاحترافية' }, // خدمة العملاء
  { lessonId: 60012, videoId: '5d74ec66-d641-494e-bde6-5103873f5314', title: 'مهارات التفاوض والإقناع' }, // التعامل مع الازمات والمخاطر
  { lessonId: 60013, videoId: 'cac1b819-6313-4c10-8a0d-d2c3ceb51917', title: 'القيادة وإدارة الفرق' }, // ورشة التحقيق العمالي
  { lessonId: 60014, videoId: 'd19812d8-64de-4a53-b8a0-1e4dfcc3e70a', title: 'مبادئ إدارة المشتريات' }, // دورة الانهاء في المواد الصحيحة
  { lessonId: 60015, videoId: '0d72f375-6c2f-427d-a334-04260d387025', title: 'التخطيط الاستراتيجي للمؤسسات' }, // FleetFlow Operation 001
  { lessonId: 60016, videoId: '5d74ec66-d641-494e-bde6-5103873f5314', title: 'إدارة التغيير المؤسسي' }, // التعامل مع الازمات والمخاطر
  { lessonId: 60017, videoId: 'c0f7ab11-536e-4fcb-8bb7-4ac77eee1227', title: 'مهارات التدريب والتطوير' }, // ادارة ضغوط العمل
  { lessonId: 60018, videoId: 'd19812d8-64de-4a53-b8a0-1e4dfcc3e70a', title: 'إدارة المخزون والجرد' }, // دورة الانهاء في المواد الصحيحة
  { lessonId: 60019, videoId: 'e3473ccb-6869-4f32-bc56-d0de93fa0d56', title: 'التخطيط والجدولة في اللوجستيات' }, // دورة تسجيل الحركة
  { lessonId: 60020, videoId: 'd31675b5-29f9-4a4e-85b3-6ccb43311a86', title: 'إدارة علاقات الموردين' }, // دورة إصدار وثيقة النقل

  // Operations path (90001-90021)
  { lessonId: 90001, videoId: 'e3473ccb-6869-4f32-bc56-d0de93fa0d56', title: 'مبادئ اللوجستيات والتوزيع' }, // دورة تسجيل الحركة
  { lessonId: 90002, videoId: 'd31675b5-29f9-4a4e-85b3-6ccb43311a86', title: 'إدارة سلسلة التوريد' }, // دورة إصدار وثيقة النقل
  { lessonId: 90003, videoId: 'd19812d8-64de-4a53-b8a0-1e4dfcc3e70a', title: 'أساسيات إدارة المستودعات' }, // دورة الانهاء في المواد الصحيحة
  { lessonId: 90004, videoId: '948566b1-3eda-40f8-9f56-760f0a772032', title: 'السلامة المرورية للسائقين المحترفين' }, // تدريب السائقين
  { lessonId: 90005, videoId: '0d72f375-6c2f-427d-a334-04260d387025', title: 'أنظمة التبريد والتجميد' }, // FleetFlow Operation 001
  { lessonId: 90006, videoId: 'f5c89f88-bb75-43bb-8946-f459fae76bde', title: 'صيانة المركبات الثقيلة' }, // التدريب على المبيعات والتشغيل
  { lessonId: 90007, videoId: '87033ec3-226b-4421-a4bb-53d2c53e3f05', title: 'إدارة الأسطول والتتبع' }, // کیف معالجة الطلب - اودو
  { lessonId: 90008, videoId: '496ddf3c-5d53-401d-be14-f64b786dab91', title: 'مهارات القيادة الدفاعية' }, // دليل السائقين
  { lessonId: 90009, videoId: 'be72d8c5-56fb-4474-b682-b86674297004', title: 'التسويق الرقمي للمبتدئين' }, // FleetFlow Sales 001
  { lessonId: 90010, videoId: 'f5c89f88-bb75-43bb-8946-f459fae76bde', title: 'مهارات البيع الاحترافي' }, // التدريب على المبيعات والتشغيل
  { lessonId: 90011, videoId: '0d72f375-6c2f-427d-a334-04260d387025', title: 'تقنيات التبريد الصناعي' }, // FleetFlow Operation 001
  { lessonId: 90012, videoId: 'f5c89f88-bb75-43bb-8946-f459fae76bde', title: 'إدارة الكهرباء والأنظمة الكهربائية' }, // التدريب على المبيعات والتشغيل
  { lessonId: 90013, videoId: '9894c192-25d6-41b2-b67b-6a5f013b4034', title: 'تقنيات الصيانة الوقائية للمركبات' }, // سجل التعثرات 01
  { lessonId: 90014, videoId: '87033ec3-226b-4421-a4bb-53d2c53e3f05', title: 'نظام GPS وتتبع الأسطول' }, // کیف معالجة الطلب - اودو
  { lessonId: 90015, videoId: '5d74ec66-d641-494e-bde6-5103873f5314', title: 'إدارة المخاطر في اللوجستيات' }, // التعامل مع الازمات والمخاطر
  { lessonId: 90016, videoId: '50fb3208-04f1-46a1-97a5-4558513a06a2', title: 'السلامة في المستودعات' }, // سياسة الجودة
  { lessonId: 90017, videoId: '5d74ec66-d641-494e-bde6-5103873f5314', title: 'إدارة الطوارئ والأزمات' }, // التعامل مع الازمات والمخاطر
  { lessonId: 90018, videoId: '50fb3208-04f1-46a1-97a5-4558513a06a2', title: 'السلامة في نقل البضائع الخطرة' }, // سياسة الجودة
  { lessonId: 90019, videoId: 'c0f7ab11-536e-4fcb-8bb7-4ac77eee1227', title: 'الإسعافات الأولية في بيئة العمل' }, // ادارة ضغوط العمل
  { lessonId: 90020, videoId: 'e3473ccb-6869-4f32-bc56-d0de93fa0d56', title: 'إدارة سلسلة الإمداد في الأزمات' }, // دورة تسجيل الحركة
  { lessonId: 90021, videoId: '50fb3208-04f1-46a1-97a5-4558513a06a2', title: 'أمن المستودعات وحماية البضائع' }, // سياسة الجودة

  // Quality path (120001-120020)
  { lessonId: 120001, videoId: 'c59657d9-c6eb-486a-bfd5-5341987b0a2b', title: 'مبادئ إدارة الجودة ISO 9001' }, // ورشة تفاعلية التدقيق المحاسبي
  { lessonId: 120002, videoId: 'd19812d8-64de-4a53-b8a0-1e4dfcc3e70a', title: 'منهجية Lean وتقليل الهدر' }, // دورة الانهاء في المواد الصحيحة
  { lessonId: 120003, videoId: 'c59657d9-c6eb-486a-bfd5-5341987b0a2b', title: 'Six Sigma للمبتدئين' }, // ورشة تفاعلية التدقيق المحاسبي
  { lessonId: 120004, videoId: '137b18d0-3796-49f2-8e45-fed63491a1dc', title: 'قياس وتحليل مؤشرات الأداء KPI' }, // التحليل و الرقابة المالية
  { lessonId: 120005, videoId: 'c59657d9-c6eb-486a-bfd5-5341987b0a2b', title: 'التدقيق الداخلي للجودة' }, // ورشة تفاعلية التدقيق المحاسبي
  { lessonId: 120006, videoId: '8fad6779-64ba-4657-926a-8ddc10cb1887', title: 'إدارة شكاوى العملاء' }, // خدمة العملاء
  { lessonId: 120007, videoId: 'f5c89f88-bb75-43bb-8946-f459fae76bde', title: 'استراتيجيات التسعير والعقود' }, // التدريب على المبيعات والتشغيل
  { lessonId: 120008, videoId: '8fad6779-64ba-4657-926a-8ddc10cb1887', title: 'إدارة علاقات العملاء CRM' }, // خدمة العملاء
  { lessonId: 120009, videoId: 'be72d8c5-56fb-4474-b682-b86674297004', title: 'تحليل السوق والمنافسين' }, // FleetFlow Sales 001
  { lessonId: 120010, videoId: 'f5c89f88-bb75-43bb-8946-f459fae76bde', title: 'إدارة عروض الأسعار والمناقصات' }, // التدريب على المبيعات والتشغيل
  { lessonId: 120011, videoId: 'f5c89f88-bb75-43bb-8946-f459fae76bde', title: 'إدارة العقود التجارية' }, // التدريب على المبيعات والتشغيل
  { lessonId: 120012, videoId: '9894c192-25d6-41b2-b67b-6a5f013b4034', title: 'أسس الصيانة الصناعية' }, // سجل التعثرات 01
  { lessonId: 120013, videoId: 'd19812d8-64de-4a53-b8a0-1e4dfcc3e70a', title: 'إدارة قطع الغيار والمخزون' }, // دورة الانهاء في المواد الصحيحة
  { lessonId: 120014, videoId: '0d72f375-6c2f-427d-a334-04260d387025', title: 'صيانة أنظمة التبريد المتقدمة' }, // FleetFlow Operation 001
  { lessonId: 120015, videoId: '9894c192-25d6-41b2-b67b-6a5f013b4034', title: 'تشخيص أعطال المركبات الثقيلة' }, // سجل التعثرات 01
  { lessonId: 120016, videoId: '50fb3208-04f1-46a1-97a5-4558513a06a2', title: 'السلامة المهنية في ورش الصيانة' }, // سياسة الجودة
  { lessonId: 120017, videoId: '87033ec3-226b-4421-a4bb-53d2c53e3f05', title: 'إدارة الأصول والمعدات' }, // کیف معالجة الطلب - اودو
  { lessonId: 120018, videoId: '87033ec3-226b-4421-a4bb-53d2c53e3f05', title: 'أنظمة التتبع والمراقبة للمركبات' }, // کیف معالجة الطلب - اودو
  { lessonId: 120019, videoId: '137b18d0-3796-49f2-8e45-fed63491a1dc', title: 'تحليل بيانات الأداء التشغيلي' }, // التحليل و الرقابة المالية
  { lessonId: 120020, videoId: 'f5c89f88-bb75-43bb-8946-f459fae76bde', title: 'إدارة تكاليف النقل والتشغيل' }, // التدريب على المبيعات والتشغيل
];

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  let updated = 0;
  for (const mapping of videoMapping) {
    const bunnyUrl = `bunny:${LIBRARY_ID}:${mapping.videoId}`;
    const [result] = await conn.execute(
      'UPDATE course_lessons SET videoUrl = ?, videoType = ? WHERE id = ?',
      [bunnyUrl, 'embed', mapping.lessonId]
    );
    if (result.affectedRows > 0) {
      updated++;
      console.log(`✓ Updated lesson ${mapping.lessonId}: ${mapping.title}`);
    } else {
      console.log(`✗ Lesson ${mapping.lessonId} not found`);
    }
  }
  
  console.log(`\nTotal updated: ${updated}/${videoMapping.length}`);
  await conn.end();
}

main().catch(console.error);
