import * as repository from "./repository";
export const list = (departmentId?: number) => repository.getFAQs(departmentId);
export const listAll = () => repository.getAllFAQs();
export const create = (input: any) => repository.createFAQ(input);
export const update = (id: number, data: any) => repository.updateFAQ(id, data);
export const remove = (id: number) => repository.deleteFAQ(id);
