import * as service from "./service";

export const getAll = ({ input, ctx }: any) => {
  if (ctx.user.role !== "admin" && !ctx.user.departmentId) return [];
  const departmentId =
    ctx.user.role === "admin" ? input.departmentId : ctx.user.departmentId;
  return service.getAll(departmentId, input.isRequired);
};
export const getStats = ({ ctx }: any) => {
  if (ctx.user.role !== "admin" && !ctx.user.departmentId) {
    return {
      total: 0,
      mandatory: 0,
      optional: 0,
      departments: 0,
      paths: 0,
      totalMinutes: 0,
    };
  }
  return service.getStats(
    ctx.user.role === "admin" ? undefined : ctx.user.departmentId
  );
};
