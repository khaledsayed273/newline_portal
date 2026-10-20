export * from "./service";
import * as service from "./service";

export const myEnrollments = ({ ctx, input }: any) => {
  const uid = input?.userId ?? ctx.user?.id;
  if (!uid) return [];
  return service.getUserEnrollments(uid);
};
export const enroll = ({ ctx, input }: any) =>
  service.enrollUser({
    userId: input.userId ?? ctx.user?.id ?? 0,
    courseId: input.courseId,
  });
export const updateProgress = ({ ctx, input }: any) =>
  service.updateEnrollmentProgress(
    input.userId ?? ctx.user?.id ?? 0,
    input.courseId,
    input.progress,
    input.completedLessons
  );
