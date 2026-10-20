export * from "./repository";
import * as repository from "./repository";

export const getBriefFiles = (departmentId?: number) =>
  repository.getBriefFiles(departmentId);
export const getAllBriefFiles = () => repository.getAllBriefFiles();
export const createBriefFile = (data: any) => repository.createBriefFile(data);
export const updateBriefFile = (id: number, data: any) =>
  repository.updateBriefFile(id, data);
export const deleteBriefFile = (id: number) => repository.deleteBriefFile(id);
