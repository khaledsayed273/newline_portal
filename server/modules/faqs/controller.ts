import * as service from "./service";
export const list = ({ input }: any) => service.list(input?.departmentId);
export const listAll = () => service.listAll();
export const create = ({ input }: any) => service.create(input);
export const update = ({ input: { id, ...data } }: any) =>
  service.update(id, data);
export const remove = ({ input }: any) => service.remove(input.id);
