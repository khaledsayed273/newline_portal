import * as service from "./service";
export const list = ({ input, ctx }: any) => {
  if (ctx.user.role !== "admin" && !ctx.user.departmentId) return [];
  const departmentId =
    ctx.user.role === "admin" ? input?.departmentId : ctx.user.departmentId;
  return service.list(departmentId);
};
export const listAll = () => service.listAll();
export const create = ({ input }: any) => service.create(input);
export const update = ({ input: { id, ...data } }: any) =>
  service.update(id, data);
export const remove = ({ input }: any) => service.remove(input.id);
