import { and, count, eq } from "drizzle-orm";
import { courseLikes, getDb } from "../../infrastructure/database";

// ========== الإعجابات على الدورات ==========
export async function toggleCourseLike(
  courseId: number,
  userId: number
): Promise<{ liked: boolean; likesCount: number }> {
  const db = await getDb();
  if (!db) return { liked: false, likesCount: 0 };
  const existing = await db
    .select()
    .from(courseLikes)
    .where(
      and(eq(courseLikes.courseId, courseId), eq(courseLikes.userId, userId))
    )
    .limit(1);
  if (existing.length > 0) {
    await db
      .delete(courseLikes)
      .where(
        and(eq(courseLikes.courseId, courseId), eq(courseLikes.userId, userId))
      );
    return { liked: false, likesCount: await getCourseLikesCount(courseId) };
  } else {
    await db.insert(courseLikes).values({ courseId, userId });
    return { liked: true, likesCount: await getCourseLikesCount(courseId) };
  }
}

export async function getCourseLikesCount(courseId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db
    .select({ count: count() })
    .from(courseLikes)
    .where(eq(courseLikes.courseId, courseId));
  return Number(result?.count ?? 0);
}

export async function isCourseLiked(
  courseId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(courseLikes)
    .where(
      and(eq(courseLikes.courseId, courseId), eq(courseLikes.userId, userId))
    )
    .limit(1);
  return result.length > 0;
}
