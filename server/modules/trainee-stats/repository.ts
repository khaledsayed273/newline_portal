import { count, desc, eq } from "drizzle-orm";
import {
  courseCompletionCerts,
  getDb,
  trainingRequests,
} from "../../infrastructure/database";

export { getUserEnrollments } from "../enrollments/repository";

// ========== إحصائيات المتدرب الشخصية ==========
export async function getTraineeCerts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: courseCompletionCerts.id,
      courseId: courseCompletionCerts.courseId,
      courseName: courseCompletionCerts.courseName,
      certCode: courseCompletionCerts.certCode,
      issuedAt: courseCompletionCerts.issuedAt,
    })
    .from(courseCompletionCerts)
    .where(eq(courseCompletionCerts.userId, userId))
    .orderBy(desc(courseCompletionCerts.issuedAt));
}

export async function getTraineeConsultationsCount(
  userId: number
): Promise<number> {
  // عدد طلبات التدريب المقدمة من المتدرب (تُعدّ استشارات)
  // الاستشارات مرتبطة بالمستخدم المصادق عليه مباشرة.
  const db = await getDb();
  if (!db) return 0;
  try {
    const [row] = await db
      .select({ count: count() })
      .from(trainingRequests)
      .where(eq(trainingRequests.userId, userId));
    return Number(row?.count ?? 0);
  } catch {
    return 0;
  }
}
