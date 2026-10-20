export * from "./service";
import * as service from "./service";

export const list = () => service.getDepartments();
export const create = ({ input }: any) => service.createDepartment(input);
export const update = ({ input: { id, ...data } }: any) =>
  service.updateDepartment(id, data);
export const remove = ({ input }: any) => service.deleteDepartment(input.id);
