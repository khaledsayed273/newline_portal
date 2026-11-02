import { and, eq } from "drizzle-orm";
import { courseRatings, getDb } from "../../infrastructure/database";

// ========== تقييم الانطباع عن الدورة ==========
export async function submitCourseRating(input: {
  courseId: number;
  userId: number;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  comment?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // حذف التقييم القديم إن وجد
  await db
    .delete(courseRatings)
    .where(
      and(
        eq(courseRatings.courseId, input.courseId),
        eq(courseRatings.userId, input.userId)
      )
    );
  await db.insert(courseRatings).values(input);
  return { success: true };
}

export async function getCourseRating(courseId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(courseRatings)
    .where(
      and(
        eq(courseRatings.courseId, courseId),
        eq(courseRatings.userId, userId)
      )
    )
    .limit(1);
  return row ?? null;
}
