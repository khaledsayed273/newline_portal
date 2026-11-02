export * from "./service";
import * as service from "./service";

export const list = ({ input, ctx }: any) => {
  if (ctx.user.role !== "admin" && !ctx.user.departmentId) return [];
  const departmentId =
    ctx.user.role === "admin" ? input?.departmentId : ctx.user.departmentId;
  return service.getBriefFiles(departmentId);
};
export const listAll = () => service.getAllBriefFiles();
export const create = ({ input }: any) => service.createBriefFile(input);
export const update = ({ input: { id, ...data } }: any) =>
  service.updateBriefFile(id, data);
export const remove = ({ input }: any) => service.deleteBriefFile(input.id);
