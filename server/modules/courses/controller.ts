import * as service from "./service";
export const list = ({ input, ctx }: any) => {
  if (ctx.user.role !== "admin" && !ctx.user.departmentId) return [];
  const departmentId =
    ctx.user.role === "admin" ? input?.departmentId : ctx.user.departmentId;
  return service.getCourses(departmentId);
};
export const listAll = () => service.getAllCourses();
export const byId = ({ input, ctx }: any) =>
  ctx.user.role !== "admin" && !ctx.user.departmentId
    ? undefined
    : service.getCourseById(
        input.id,
        ctx.user.role === "admin" ? undefined : ctx.user.departmentId
      );
export const create = ({ input }: any) => service.createCourse(input);
export const update = ({ input: { id, ...data } }: any) =>
  service.updateCourse(id, data);
export const remove = ({ input }: any) => service.deleteCourse(input.id);
