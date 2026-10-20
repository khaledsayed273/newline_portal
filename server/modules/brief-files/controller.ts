export * from "./service";
import * as service from "./service";

export const list = ({ input }: any) =>
  service.getBriefFiles(input?.departmentId);
export const listAll = () => service.getAllBriefFiles();
export const create = ({ input }: any) => service.createBriefFile(input);
export const update = ({ input: { id, ...data } }: any) =>
  service.updateBriefFile(id, data);
export const remove = ({ input }: any) => service.deleteBriefFile(input.id);
