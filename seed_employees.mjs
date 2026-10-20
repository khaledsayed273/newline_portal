import "dotenv/config";
import { randomBytes, scrypt as _scrypt } from "node:crypto";
import { promisify } from "node:util";
import mysql from "mysql2/promise";

const scrypt = promisify(_scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

// قائمة الموظفين: [الرقم الوظيفي, الاسم العربي]
const EMPLOYEES = [
  ["999", "عبدالعزيز عايد الدهري"],
  ["1000", "طارق سعود الدهري العنزي"],
  ["1001", "عصام رجب محمد"],
  ["1010", "وسيم شوكت شوكت علي"],
  ["1011", "إبراهيم السيد إبراهيم"],
  ["1013", "جزاء بجاد البقمي"],
  ["1014", "مؤمن محمد عمر"],
  ["1015", "مرزوق محمد عبدالغني غريب"],
  ["1028", "فاضل حق اسماعيل محمد"],
  ["1029", "هشام محمود يوسف عرابي"],
  ["1039", "زيشان حيدر غلام حيدر"],
  ["1040", "احمد عزمي عبده سليمان"],
  ["1042", "معتز نصر محمد صالح"],
  ["1048", "ناصر عبدالمحسن الصياحي"],
  ["2009", "بابار علي محمد منير"],
  ["2018", "فيصل شهزاد باز خان"],
  ["2038", "محمد فرحان منساب خان"],
  ["2098", "فخر عباس الحاج احمد"],
  ["3000", "رضا شوقى عبد الحميد"],
  ["3002", "عبدالله محمد رجب"],
  ["4018", "عمران عظيم الله"],
  ["4024", "اكبر كابا كامالدين"],
  ["5000", "عبدالرحمن عبدالله عبدالرحمن"],
  ["1063", "معصوم بالله"],
  ["1069", "كريم ابراهيم شعبان ابراهيم"],
  ["1070", "محمد رحمان قل"],
  ["1071", "محمد وليد نعيم فرحات"],
  ["1072", "محمد عطيه عبدالوهاب عبدالغني"],
  ["1074", "عمر محمد سيد بيومي"],
  ["1075", "طلال سعود الدهري"],
  ["1080", "مجدي محمد عبدالرحمن"],
  ["1081", "عمرو عادل يونس احمد"],
  ["1082", "عبدالرحمن ياسر سيد"],
  ["5001", "محمد احمد محمد عثمان"],
  ["1087", "شادي جلال شعبان ابو السعود"],
  ["1089", "احمد محمد عبدالمنعم حسين"],
  ["1090", "محمد طه"],
  ["1092", "عبدالاله عايد العنزي"],
  ["1094", "محمد جبد محمد عرفان"],
  ["1095", "حفيظ محمد علي زاهد"],
  ["1096", "نواف عبدالله الدوسري"],
  ["1102", "مراد محمد حمدي"],
  ["1104", "مبشر علي مراد علي"],
  ["1105", "سعود سلامه العنزي"],
  ["1108", "احمد صبحي عبد العاطي الجيزاوي"],
  ["1109", "عبد الرحمن ايمن محمد عبده"],
  ["1111", "عبدالرحمن الحسيني محمد احمد"],
  ["1112", "نافيد احسن رنا خليل احمد"],
  // employeeNumber "0" مكرر مرتين — لا يمكن إدراجه بسبب UNIQUE constraint
  // ["0", "سالم محمود محمد الجنيدي"],
  // ["0", "جهاد احمد عبدالرحيم يوسف"],
  ["5002", "اسامة محمد نجيب عبد الغني"],
  ["1113", "ايتيم اول حق مخنار احمد"],
];

const DEFAULT_PASSWORD = "123456";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (check source/.env)");
  process.exit(1);
}

const conn = await mysql.createConnection(process.env.DATABASE_URL);
let created = 0;
let updated = 0;
let skipped = 0;

try {
  for (const [employeeNumber, name] of EMPLOYEES) {
    if (!employeeNumber || employeeNumber === "0") {
      console.warn(`Skipping invalid employeeNumber: ${employeeNumber ?? "(empty)"} for ${name}`);
      skipped++;
      continue;
    }

    const passwordHash = await hashPassword(DEFAULT_PASSWORD);
    const [rows] = await conn.execute(
      "SELECT `id` FROM `users` WHERE `employeeNumber` = ? LIMIT 1",
      [employeeNumber]
    );

    if (rows.length > 0) {
      await conn.execute(
        "UPDATE `users` SET `passwordHash` = ?, `role` = 'user', `name` = ? WHERE `id` = ?",
        [passwordHash, name, rows[0].id]
      );
      updated++;
    } else {
      await conn.execute(
        "INSERT INTO `users` (`employeeNumber`, `name`, `passwordHash`, `role`, `lastSignedIn`) VALUES (?, ?, ?, 'user', NOW())",
        [employeeNumber, name, passwordHash]
      );
      created++;
    }
  }

  console.log(`Seeding Done: created=${created}, updated=${updated}, skipped=${skipped}`);
} finally {
  await conn.end();
}
