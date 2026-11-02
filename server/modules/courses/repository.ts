import { and, eq } from "drizzle-orm";
import {
  courses,
  Course,
  getDb,
  InsertCourse,
} from "../../infrastructure/database";

// ========== الدورات ==========
export async function getCourses(departmentId?: number): Promise<Course[]> {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(courses);
  if (departmentId) {
    return query
      .where(
        and(
          eq(courses.departmentId, departmentId),
          eq(courses.isPublished, true)
        )
      )
      .orderBy(courses.order);
  }
  return query.where(eq(courses.isPublished, true)).orderBy(courses.order);
}

export async function getAllCourses(): Promise<Course[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).orderBy(courses.order);
}

export async function getCourseById(
  id: number,
  departmentId?: number
): Promise<Course | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(courses)
    .where(
      departmentId === undefined
        ? eq(courses.id, id)
        : and(eq(courses.id, id), eq(courses.departmentId, departmentId))
    )
    .limit(1);
  return result[0];
}

export async function createCourse(
  data: InsertCourse
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(courses).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateCourse(
  id: number,
  data: Partial<InsertCourse>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(courses).set(data).where(eq(courses.id, id));
}

export async function deleteCourse(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(courses).where(eq(courses.id, id));
}

// دروس الدورة تُدار من وحدة lessons، وتُعاد هنا لسهولة استهلاكها من خدمات الدورات.
export { getAllCourseLessons } from "../lessons/repository";
