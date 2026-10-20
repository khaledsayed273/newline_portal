export * from "./repository";
import * as repository from "./repository";

export const getUserEnrollments = (userId: number) =>
  repository.getUserEnrollments(userId);
export const enrollUser = (data: any) => repository.enrollUser(data);
export const updateEnrollmentProgress = (
  userId: number,
  courseId: number,
  progress: number,
  completedLessons: number[]
) =>
  repository.updateEnrollmentProgress(
    userId,
    courseId,
    progress,
    completedLessons
  );
