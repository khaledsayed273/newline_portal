export * from "./service";
import * as service from "./service";
import { TRPCError } from "@trpc/server";
import { getCourseById } from "../../infrastructure/repositories";

async function assertCourseAccess(ctx: any, courseId: number) {
  const course = await getCourseById(courseId);
  if (!course || (ctx.user.role !== "admin" && course.departmentId !== ctx.user.departmentId)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "لا يمكنك الوصول إلى دورة من إدارة أخرى",
    });
  }
}

export const myEnrollments = ({ ctx, input }: any) => {
  return service.getUserEnrollments(ctx.user.id);
};
export const enroll = async ({ ctx, input }: any) => {
  await assertCourseAccess(ctx, input.courseId);
  return service.enrollUser({
    userId: ctx.user.id,
    courseId: input.courseId,
  });
};
export const updateProgress = ({ ctx, input }: any) =>
  service.updateEnrollmentProgress(
    ctx.user.id,
    input.courseId,
    input.progress,
    input.completedLessons
  );
