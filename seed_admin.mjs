// سكريبت لمرة واحدة: إنشاء/تحديث حساب أدمن محلي (أوفلاين).
// الاستخدام: node seed_admin.mjs 1013 123456
// الباسورد يُمرر كأرجومنت فقط ولا يُحفظ في أي ملف.
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

const [employeeNumber, password] = process.argv.slice(2);

if (!employeeNumber || !password) {
  console.error("Usage: node seed_admin.mjs <employeeNumber> <password>");
  process.exit(1);
}
if (password.length < 6) {
  console.error("Password must be at least 6 characters");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (check source/.env)");
  process.exit(1);
}

const conn = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const normalizedNumber = employeeNumber.trim();
  const passwordHash = await hashPassword(password);
  const [rows] = await conn.execute(
    "SELECT `id` FROM `users` WHERE `employeeNumber` = ? LIMIT 1",
    [normalizedNumber]
  );

  if (rows.length > 0) {
    await conn.execute(
      "UPDATE `users` SET `passwordHash` = ?, `role` = 'admin' WHERE `id` = ?",
      [passwordHash, rows[0].id]
    );
    console.log(`Updated existing user #${rows[0].id} to admin with new password`);
  } else {
    await conn.execute(
      "INSERT INTO `users` (`employeeNumber`, `name`, `passwordHash`, `role`, `lastSignedIn`) VALUES (?, ?, ?, 'admin', NOW())",
      [normalizedNumber, "مدير النظام", passwordHash]
    );
    console.log(`Created admin user ${normalizedNumber}`);
  }
  console.log("Done — change this password after first login.");
} finally {
  await conn.end();
}
