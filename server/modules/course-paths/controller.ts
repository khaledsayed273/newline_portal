import { TRPCError } from "@trpc/server";
import * as service from "./service";
export const listAll = () => service.getAllCoursePaths();
export const byDepartment = ({ input, ctx }: any) =>
  ctx.user.role === "admin" || ctx.user.departmentId === input.departmentId
    ? service.getCoursePathsByDepartment(input.departmentId)
    : [];
export const withCourses = async ({ input, ctx }: any) => {
  const path = await service.getCoursePathWithCourses(input.pathId, ctx.user.id);
  if (!path) return undefined;
  return ctx.user.role === "admin" || ctx.user.departmentId === path.departmentId
    ? path
    : undefined;
};
export const withProgress = ({ input, ctx }: any) =>
  ctx.user.role === "admin" || ctx.user.departmentId === input.departmentId
    ? service.getPathsWithProgressForDepartment(ctx.user.id, input.departmentId)
    : [];
export const progress = ({ input, ctx }: any) =>
  service.getPathProgress(ctx.user.id, input.pathId);
export const updateProgress = ({ input, ctx }: any) =>
  service.upsertPathProgress(
    ctx.user.id,
    input.pathId,
    input.completedCourses,
    input.totalCourses
  );
export const issueCertificate = async ({ input, ctx }: any) => {
  const progress = await service.getPathProgress(ctx.user.id, input.pathId);
  if (!progress?.isCompleted)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "لم يتم إكمال المسار بعد",
    });
  await service.issueCertificateForPath(ctx.user.id, input.pathId);
  return { success: true };
};
export const create = ({ input }: any) => service.createCoursePath(input);
export const update = ({ input: { id, ...data } }: any) =>
  service.updateCoursePath(id, data);
export const addCourse = ({ input }: any) =>
  service.addCourseToPath(input.pathId, input.courseId, input.order);
export const removeCourse = ({ input }: any) =>
  service.removeCourseFromPath(input.pathId, input.courseId);
export const remove = ({ input }: any) => service.deleteCoursePath(input.id);
