export * from "./repository";
import * as repository from "./repository";

export const getDepartments = () => repository.getDepartments();
export const createDepartment = (data: any) =>
  repository.createDepartment(data);
export const updateDepartment = (id: number, data: any) =>
  repository.updateDepartment(id, data);
export const deleteDepartment = (id: number) => repository.deleteDepartment(id);
