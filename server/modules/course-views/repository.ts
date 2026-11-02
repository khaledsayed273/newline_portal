import { count, eq } from "drizzle-orm";
import { courseViews, getDb } from "../../infrastructure/database";

// ========== مشاهدات الدورات ==========
export async function recordCourseView(
  courseId: number,
  userId?: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(courseViews).values({ courseId, userId });
}

export async function getCourseViewsCount(courseId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db
    .select({ count: count() })
    .from(courseViews)
    .where(eq(courseViews.courseId, courseId));
  return Number(result?.count ?? 0);
}
