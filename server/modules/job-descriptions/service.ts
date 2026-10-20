import * as repository from "./repository";
export const list = (departmentId?: number) =>
  repository.getJobDescriptions(departmentId);
export const listAll = () => repository.getAllJobDescriptions();
export const create = (input: any) => repository.createJobDescription(input);
export const update = (id: number, data: any) =>
  repository.updateJobDescription(id, data);
export const remove = (id: number) => repository.deleteJobDescription(id);
