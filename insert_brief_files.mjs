import mysql from 'mysql2/promise';
import fs from 'fs';

const url = process.env.DATABASE_URL;
const conn = await mysql.createConnection(url);

// حذف البيانات القديمة
await conn.execute('DELETE FROM brief_files');
console.log('Cleared old brief_files');

const files = [
  // التشغيل (departmentId=2)
  { title: 'ملف سلامة الرحلة', description: 'يشمل خطوات استلام الطلب بشكل صحيح، وقواعد إصدار وثيقة النقل، ومتطلبات سلامة الرحلة', departmentId: 2, fileUrl: '/manus-storage/trip_safety_file_2d434731_115078c7.pdf', fileType: 'pdf', fileSize: 16607166, order: 1 },
  { title: 'دليل مهام الحركة', description: 'دليل شامل لمهام المشرف في الحركة', departmentId: 2, fileUrl: '/manus-storage/movement_guide_b4c263c0_5a200dad.pdf', fileType: 'pdf', fileSize: 1177049, order: 2 },
  { title: 'دليل السائقين', description: 'الدليل الشامل للسائقين في شركة نيولاين', departmentId: 2, fileUrl: '/manus-storage/drivers_guide_77c348a7_a2be8ca4.pdf', fileType: 'pdf', fileSize: 5958882, order: 3 },
  { title: 'الدليل التعليمي للتشغيل', description: 'الدليل التعليمي الشامل لقسم التشغيل', departmentId: 2, fileUrl: '/manus-storage/operations_guide_046b6d8e_5eaf3981.pdf', fileType: 'pdf', fileSize: 866385, order: 4 },
  { title: 'دليل متابعة السائقين', description: 'دليل شامل لمتابعة السائقين وتقييم أدائهم', departmentId: 2, fileUrl: '/manus-storage/driver_monitoring_guide_83d834fc_fd49ce98.pdf', fileType: 'pdf', fileSize: 17057289, order: 5 },
  { title: 'دليل السلامة', description: 'الدليل الشامل لإجراءات السلامة والصحة المهنية', departmentId: 2, fileUrl: '/manus-storage/safety_guide_84be59ff_9d1046b3.pdf', fileType: 'pdf', fileSize: 12412841, order: 6 },
  { title: 'دليل الأمطار والعواصف', description: 'إرشادات التعامل مع الأمطار والعواصف وضمان سلامة العمليات', departmentId: 2, fileUrl: '/manus-storage/storms_guide_8d6dfa8f_6892ca88.pdf', fileType: 'pdf', fileSize: 1253926, order: 7 },
  { title: 'الدليل التعليمي للجودة', description: 'الدليل التعليمي الشامل لمعايير الجودة', departmentId: 2, fileUrl: '/manus-storage/quality_guide_cbaa71e5_fb26434c.pdf', fileType: 'pdf', fileSize: 982804, order: 8 },
  { title: 'سياسة الجودة', description: 'وثيقة سياسة الجودة المعتمدة في نيولاين', departmentId: 2, fileUrl: '/manus-storage/quality_policy1_bd30602e_03912ea6.pdf', fileType: 'pdf', fileSize: 950071, order: 9 },
  { title: 'سياسة الجودة (نسخة 2)', description: 'النسخة المحدّثة من وثيقة سياسة الجودة', departmentId: 2, fileUrl: '/manus-storage/quality_policy2_fcab91bf_5c546ae2.pdf', fileType: 'pdf', fileSize: 950071, order: 10 },
  { title: 'دليل سياسة الجودة', description: 'الدليل التفصيلي لتطبيق سياسة الجودة', departmentId: 2, fileUrl: '/manus-storage/quality_policy_guide_407d00e9_1eca5efb.pdf', fileType: 'pdf', fileSize: 1262382, order: 11 },

  // الصيانة والمرافق (departmentId=5)
  { title: 'دليل الصيانة', description: 'الدليل الشامل للصيانة في شركة نيولاين', departmentId: 5, fileUrl: '/manus-storage/maintenance_guide_96d002dc_19f16dc2.pdf', fileType: 'pdf', fileSize: 437746, order: 1 },
  { title: 'دليل المرافق', description: 'الدليل الشامل للمرافق والخدمات المساندة', departmentId: 5, fileUrl: '/manus-storage/facilities_guide_ba4fa275_77beb6c8.pdf', fileType: 'pdf', fileSize: 1630017, order: 2 },
  { title: 'دليل تعليمات التعامل مع الحوادث', description: 'دليل شامل يوضح الإجراءات الصحيحة للتعامل مع الحوادث', departmentId: 5, fileUrl: '/manus-storage/accident_handling_guide_39ffe342_bda76b55.pdf', fileType: 'pdf', fileSize: 6644598, order: 3 },

  // المبيعات (departmentId=3)
  { title: 'دليل مهام المبيعات', description: 'الدليل الشامل لمهام مندوب المبيعات', departmentId: 3, fileUrl: '/manus-storage/sales_guide_ff12a64a_ec754bbb.pdf', fileType: 'pdf', fileSize: 929951, order: 1 },
  { title: 'الدليل التنظيمي للمبيعات', description: 'الدليل التنظيمي الشامل لقسم المبيعات', departmentId: 3, fileUrl: '/manus-storage/sales_org_guide_7327d157_2b9643fa.pdf', fileType: 'pdf', fileSize: 1413396, order: 2 },
  { title: 'كيف تتحدث مع العميل', description: 'دليل مهارات التواصل مع العملاء وتقنيات البيع الفعّال', departmentId: 3, fileUrl: '/manus-storage/customer_talk_guide_94175aab_fb8efbed.pdf', fileType: 'pdf', fileSize: 13130773, order: 3 },

  // المالية (departmentId=4)
  { title: 'معايير المحاسبة الدولية IFRS', description: 'دليل شامل يضم معايير المحاسبة الدولية IFRS المعتمدة', departmentId: 4, fileUrl: '/manus-storage/ifrs_combined_8c5ce08a_ea9aaebf.pdf', fileType: 'pdf', fileSize: 12339776, order: 1 },

  // الخدمات المشتركة (departmentId=1)
  { title: 'الدليل التعليمي للموارد البشرية', description: 'الدليل التعليمي الشامل لقسم الموارد البشرية', departmentId: 1, fileUrl: '/manus-storage/hr_guide_3334f31b_5d0f30d9.pdf', fileType: 'pdf', fileSize: 244627, order: 1 },
  { title: 'مهارات قانونية لنظام العمل السعودي', description: 'دليل المهارات القانونية الأساسية لنظام العمل السعودي', departmentId: 1, fileUrl: '/manus-storage/labor_law_guide_caf1621b_1af9dabf.pdf', fileType: 'pdf', fileSize: 822842, order: 2 },
  { title: 'دليل شؤون الموظفين', description: 'الدليل الشامل لإجراءات شؤون الموظفين', departmentId: 1, fileUrl: '/manus-storage/employee_affairs_ebb6c0e4_26713f7b.pdf', fileType: 'pdf', fileSize: 159008, order: 3 },
  { title: 'دليل نظام العمل التفصيلي', description: 'الدليل التفصيلي الشامل لنظام العمل السعودي', departmentId: 1, fileUrl: '/manus-storage/labor_law_detailed_cd95580b_290da26c.pdf', fileType: 'pdf', fileSize: 397371, order: 4 },
  { title: 'إصابة العمل', description: 'دليل إجراءات إصابات العمل والتعويضات', departmentId: 1, fileUrl: '/manus-storage/work_injury_44cd7a91_8110ff04.pdf', fileType: 'pdf', fileSize: 446532, order: 5 },
  { title: 'نسب التأمينات الاجتماعية الجديد', description: 'جدول نسب التأمينات الاجتماعية المحدّثة', departmentId: 1, fileUrl: '/manus-storage/social_insurance_rates_8780aafb_2eaad0b3.pdf', fileType: 'pdf', fileSize: 1232647, order: 6 },
  { title: 'التحقيق الإداري', description: 'دليل إجراءات التحقيق الإداري في المخالفات', departmentId: 1, fileUrl: '/manus-storage/admin_investigation_1899ca57_e5278a35.pdf', fileType: 'pdf', fileSize: 185201, order: 7 },
  { title: 'نطاقات المطور', description: 'دليل نطاقات نظام حماية الأجور المطوّر', departmentId: 1, fileUrl: '/manus-storage/nitaqat_advanced_2cf1b198_f16aa1d0.pdf', fileType: 'pdf', fileSize: 1896728, order: 8 },
  { title: 'العقوبات النظامية', description: 'جدول العقوبات النظامية وفق نظام العمل السعودي', departmentId: 1, fileUrl: '/manus-storage/legal_penalties_b1972aad_6669e1fe.pdf', fileType: 'pdf', fileSize: 435480, order: 9 },
  { title: 'مبادرات الموارد البشرية', description: 'دليل مبادرات تطوير الموارد البشرية', departmentId: 1, fileUrl: '/manus-storage/hr_initiatives_2e947257_41f17349.pdf', fileType: 'pdf', fileSize: 189312, order: 10 },
  { title: 'موازنة الموارد البشرية', description: 'دليل إعداد وإدارة موازنة الموارد البشرية', departmentId: 1, fileUrl: '/manus-storage/hr_budget_9004f605_0332aa8b.pdf', fileType: 'pdf', fileSize: 164240, order: 11 },
  { title: 'عقود نظام العمل', description: 'نماذج وإرشادات عقود نظام العمل السعودي', departmentId: 1, fileUrl: '/manus-storage/labor_contracts_6b94fc7c_b737a83d.pdf', fileType: 'pdf', fileSize: 317873, order: 12 },
  { title: 'المنصات الحكومية', description: 'دليل استخدام المنصات الحكومية الإلكترونية', departmentId: 1, fileUrl: '/manus-storage/gov_platforms_018663cd_b658591f.pdf', fileType: 'pdf', fileSize: 436811, order: 13 },
  { title: 'تطوير الموارد البشرية', description: 'دليل برامج تطوير الموارد البشرية وبناء الكفاءات', departmentId: 1, fileUrl: '/manus-storage/hr_development_49efaac3_6e325084.pdf', fileType: 'pdf', fileSize: 164140, order: 14 },
  { title: 'الاختصار لفهم نظام العمل', description: 'ملخص مختصر وشامل لأبرز أحكام نظام العمل السعودي', departmentId: 1, fileUrl: '/manus-storage/labor_law_summary_8b809444_bf4c0732.pdf', fileType: 'pdf', fileSize: 8178674, order: 15 },
  { title: 'خرائط ذهنية', description: 'خرائط ذهنية تلخّص المفاهيم الأساسية للموارد البشرية', departmentId: 1, fileUrl: '/manus-storage/mind_maps_1b672e10_105ca921.pdf', fileType: 'pdf', fileSize: 7766154, order: 16 },
  { title: 'غلاف دليل الخدمات المشتركة', description: 'غلاف الدليل الشامل للخدمات المشتركة', departmentId: 1, fileUrl: '/manus-storage/shared_guide_cover_6fe0c89a_2406ca96.png', fileType: 'image', fileSize: 1561124, order: 17 },
  { title: 'نقدم خدماتنا للموظفين بجودة ودقة', description: 'رسالة الخدمات المشتركة في تقديم الخدمات بجودة عالية', departmentId: 1, fileUrl: '/manus-storage/shared_guide_quality_50055138_15d8b8fe.png', fileType: 'image', fileSize: 1715865, order: 18 },
  { title: 'أهداف مبادرات الخدمات المشتركة لتحسين بيئة العمل', description: 'عرض أهداف مبادرات الخدمات المشتركة لتحسين بيئة العمل', departmentId: 1, fileUrl: '/manus-storage/shared_guide_initiatives_5cc9a5ff_e039cd1a.png', fileType: 'image', fileSize: 1436696, order: 19 },
  { title: 'كيفية التعامل مع طلبات الموظفين', description: 'إرشادات التعامل مع طلبات الموظفين وتلبية احتياجاتهم', departmentId: 1, fileUrl: '/manus-storage/shared_guide_requests_763ab54d_1ab19660.png', fileType: 'image', fileSize: 1641300, order: 20 },
  { title: 'أهداف الخدمات المشتركة', description: 'عرض الأهداف الاستراتيجية لإدارة الخدمات المشتركة', departmentId: 1, fileUrl: '/manus-storage/shared_guide_goals_4070dfae_b34ea44e.png', fileType: 'image', fileSize: 1185026, order: 21 },
  { title: 'التواصل بين موظف الموارد البشرية والموظفين', description: 'دليل قنوات التواصل الفعّال بين الموارد البشرية والموظفين', departmentId: 1, fileUrl: '/manus-storage/shared_guide_communication_b15cbb8e_efec8d50.png', fileType: 'image', fileSize: 1550173, order: 22 },
];

let inserted = 0;
for (const f of files) {
  await conn.execute(
    'INSERT INTO brief_files (title, description, departmentId, fileUrl, fileType, fileSize, isPublished, `order`) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
    [f.title, f.description, f.departmentId, f.fileUrl, f.fileType, f.fileSize, f.order]
  );
  inserted++;
  process.stdout.write('.');
}

const [rows] = await conn.execute('SELECT COUNT(*) as total FROM brief_files');
console.log(`\nInserted: ${inserted}, Total in DB: ${rows[0].total}`);

// التحقق من التوزيع
const [dist] = await conn.execute(`
  SELECT d.name, COUNT(bf.id) as count 
  FROM departments d 
  LEFT JOIN brief_files bf ON bf.departmentId = d.id 
  GROUP BY d.id, d.name 
  ORDER BY d.id
`);
console.log('\nDistribution by department:');
for (const row of dist) {
  console.log(`  ${row.name}: ${row.count} files`);
}

await conn.end();
