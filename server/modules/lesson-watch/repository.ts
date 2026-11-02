import { and, eq } from "drizzle-orm";
import {
  getDb,
  lessonWatchProgress,
} from "../../infrastructure/database";
import { syncCourseEnrollmentCompletion } from "../enrollments/repository";
import { recalcPathProgressForUser } from "../course-paths/repository";

export { recalcPathProgressForUser } from "../course-paths/repository";

// ========== تتبع مشاهدة الدروس ==========
export async function getLessonWatchProgress(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(lessonWatchProgress)
    .where(
      and(
        eq(lessonWatchProgress.userId, userId),
        eq(lessonWatchProgress.lessonId, lessonId)
      )
    )
    .limit(1);
  return row ?? null;
}

export async function upsertLessonWatchProgress(
  userId: number,
  lessonId: number,
  courseId: number,
  watchedSeconds: number,
  totalSeconds: number,
  lastPositionSeconds?: number
) {
  const db = await getDb();
  if (!db) return null;
  const safeTotalSeconds = Math.max(1, Math.round(totalSeconds));
  const safeWatchedSeconds = Math.min(
    safeTotalSeconds,
    Math.max(0, Math.round(watchedSeconds))
  );
  const safeLastPositionSeconds = Math.min(
    safeTotalSeconds,
    Math.max(0, Math.round(lastPositionSeconds ?? safeWatchedSeconds))
  );
  const isCompleted = safeWatchedSeconds >= safeTotalSeconds;
  const completedAt = isCompleted ? new Date() : null;
  const existing = await getLessonWatchProgress(userId, lessonId);
  if (!existing) {
    await db.insert(lessonWatchProgress).values({
      userId,
      lessonId,
      courseId,
      watchedSeconds: safeWatchedSeconds,
      lastPositionSeconds: safeLastPositionSeconds,
      totalSeconds: safeTotalSeconds,
      isCompleted,
      completedAt,
    });
  } else {
    await db
      .update(lessonWatchProgress)
      .set({
        watchedSeconds: Math.max(
          existing.watchedSeconds ?? 0,
          safeWatchedSeconds
        ),
        lastPositionSeconds: safeLastPositionSeconds,
        totalSeconds:
          safeTotalSeconds > 0
            ? safeTotalSeconds
            : (existing.totalSeconds ?? safeTotalSeconds),
        isCompleted: isCompleted || existing.isCompleted,
        completedAt:
          isCompleted && !existing.completedAt
            ? completedAt
            : existing.completedAt,
      })
      .where(eq(lessonWatchProgress.id, existing.id));
  }
  await syncCourseEnrollmentCompletion(userId, courseId);
  return { isCompleted };
}

// تسجيل درس كامل يدويًا (دروس الملفات: PDF / Word / ZIP)
export async function markLessonComplete(
  userId: number,
  lessonId: number,
  courseId: number
): Promise<{ isCompleted: boolean }> {
  const db = await getDb();
  if (!db) return { isCompleted: false };
  try {
    const existing = await getLessonWatchProgress(userId, lessonId);
    if (existing) {
      if (!existing.isCompleted) {
        await db
          .update(lessonWatchProgress)
          .set({ isCompleted: true, completedAt: existing.completedAt ?? new Date() })
          .where(eq(lessonWatchProgress.id, existing.id));
      }
    } else {
      await db.insert(lessonWatchProgress).values({
        userId,
        lessonId,
        courseId,
        watchedSeconds: 1,
        totalSeconds: 1,
        isCompleted: true,
        completedAt: new Date(),
      });
    }
    await recalcPathProgressForUser(userId, courseId);
    await syncCourseEnrollmentCompletion(userId, courseId);
  } catch (error) {
    console.error("[markLessonComplete]", error);
    return { isCompleted: false };
  }
  return { isCompleted: true };
}

export async function getCourseWatchProgress(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(lessonWatchProgress)
    .where(
      and(
        eq(lessonWatchProgress.userId, userId),
        eq(lessonWatchProgress.courseId, courseId)
      )
    );
}
