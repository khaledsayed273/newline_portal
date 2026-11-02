import { and, eq } from "drizzle-orm";
import {
  courseLessons,
  CourseLesson,
  getDb,
  InsertCourseLesson,
} from "../../infrastructure/database";

// ========== دروس الدورة ==========
export async function getCourseLessons(
  courseId: number
): Promise<CourseLesson[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(courseLessons)
    .where(
      and(
        eq(courseLessons.courseId, courseId),
        eq(courseLessons.isPublished, true)
      )
    )
    .orderBy(courseLessons.order);
}

export async function getAllCourseLessons(
  courseId: number
): Promise<CourseLesson[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(courseLessons)
    .where(eq(courseLessons.courseId, courseId))
    .orderBy(courseLessons.order);
}

export async function getCourseLessonById(
  id: number
): Promise<CourseLesson | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(courseLessons)
    .where(eq(courseLessons.id, id))
    .limit(1);
  return result[0];
}

export async function createLesson(
  data: InsertCourseLesson
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(courseLessons).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateLesson(
  id: number,
  data: Partial<InsertCourseLesson>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(courseLessons).set(data).where(eq(courseLessons.id, id));
}

export async function deleteLesson(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(courseLessons).where(eq(courseLessons.id, id));
}
