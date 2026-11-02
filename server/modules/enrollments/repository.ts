import { and, count, eq } from "drizzle-orm";
import {
  courseLessons,
  enrollments,
  Enrollment,
  getDb,
  InsertEnrollment,
  lessonWatchProgress,
} from "../../infrastructure/database";
import { recalcPathProgressForUser } from "../course-paths/repository";

// ========== التسجيلات ==========
export async function getEnrollment(
  userId: number,
  courseId: number
): Promise<Enrollment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(enrollments)
    .where(
      and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))
    )
    .limit(1);
  return result[0];
}

export async function getUserEnrollments(
  userId: number
): Promise<Enrollment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.userId, userId));
}

export async function enrollUser(data: InsertEnrollment): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(enrollments)
    .values(data)
    .onDuplicateKeyUpdate({ set: { enrolledAt: new Date() } });
}

export async function updateEnrollmentProgress(
  userId: number,
  courseId: number,
  progress: number,
  completedLessons: number[]
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const isCompleted = progress >= 100;
  await db
    .update(enrollments)
    .set({
      progress,
      completedLessons,
      isCompleted,
      completedAt: isCompleted ? new Date() : undefined,
    })
    .where(
      and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))
    );
  await recalcPathProgressForUser(userId, courseId);
}

// ========== مزامنة تقدّم وإتمام الدورة في جدول التسجيلات ==========
export async function syncCourseEnrollmentCompletion(
  userId: number,
  courseId: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    const [totalRow] = await db
      .select({ count: count() })
      .from(courseLessons)
      .where(
        and(
          eq(courseLessons.courseId, courseId),
          eq(courseLessons.isPublished, true)
        )
      );
    const totalLessons = Number(totalRow?.count ?? 0);
    if (totalLessons === 0) return;

    const completedRows = await db
      .select({ lessonId: lessonWatchProgress.lessonId })
      .from(lessonWatchProgress)
      .where(
        and(
          eq(lessonWatchProgress.userId, userId),
          eq(lessonWatchProgress.courseId, courseId),
          eq(lessonWatchProgress.isCompleted, true)
        )
      );
    const completedLessons = Array.from(
      new Set(completedRows.map(r => Number(r.lessonId)))
    );
    const progress = Math.min(
      100,
      Math.round((completedLessons.length / totalLessons) * 100)
    );
    const isCompleted = completedLessons.length >= totalLessons;

    const [existing] = await db
      .select({ id: enrollments.id, completedAt: enrollments.completedAt })
      .from(enrollments)
      .where(
        and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))
      )
      .limit(1);
    const completedAt = isCompleted
      ? (existing?.completedAt ?? new Date())
      : undefined;
    if (existing) {
      await db
        .update(enrollments)
        .set({
          progress,
          completedLessons,
          isCompleted: isCompleted || false,
          completedAt,
        })
        .where(eq(enrollments.id, existing.id));
    } else {
      await db.insert(enrollments).values({
        userId,
        courseId,
        progress,
        completedLessons,
        isCompleted,
        completedAt: isCompleted ? completedAt : null,
      });
    }
  } catch (error) {
    console.error("[syncCourseEnrollmentCompletion]", error);
  }
}
