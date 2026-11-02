import { and, eq } from "drizzle-orm";
import {
  courseCompletionCerts,
  getDb,
} from "../../infrastructure/database";

// ========== شهادة إتمام الدورة ==========
export async function getCourseCompletionCert(
  courseId: number,
  userId: number
) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(courseCompletionCerts)
    .where(
      and(
        eq(courseCompletionCerts.courseId, courseId),
        eq(courseCompletionCerts.userId, userId)
      )
    )
    .limit(1);
  return row ?? null;
}

export async function getCourseCompletionCertByCode(certCode: string) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(courseCompletionCerts)
    .where(eq(courseCompletionCerts.certCode, certCode))
    .limit(1);
  return row ?? null;
}

export async function issueCourseCompletionCert(input: {
  courseId: number;
  userId: number;
  fullName: string;
  employeeId: string;
  courseName: string;
  departmentName?: string;
  score: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // تحقق من عدم وجود شهادة سابقة
  const existing = await getCourseCompletionCert(input.courseId, input.userId);
  if (existing) return existing;
  // توليد رمز الشهادة
  const certCode = `NL-${input.courseId}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  await db.insert(courseCompletionCerts).values({ ...input, certCode });
  return { certCode, issuedAt: new Date() };
}
