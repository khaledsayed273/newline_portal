import * as repository from "./repository";

export const getProgress = (userId: number, lessonId: number) =>
  repository.getLessonWatchProgress(userId, lessonId);
export const updateProgress = (userId: number, input: any) =>
  repository.upsertLessonWatchProgress(
    userId,
    input.lessonId,
    input.courseId,
    input.watchedSeconds,
    input.totalSeconds
  );
export const getCourseProgress = (userId: number, courseId: number) =>
  repository.getCourseWatchProgress(userId, courseId);
export const recalcPathProgress = (userId: number, courseId: number) =>
  repository.recalcPathProgressForUser(userId, courseId);
export const markComplete = (userId: number, input: any) =>
  repository.markLessonComplete(userId, input.lessonId, input.courseId);
