import * as repository from "./repository";

export const mine = (userId: number) => repository.getUserConsultations(userId);
export const all = () => repository.getAllConsultations();
export const create = (data: any) => repository.createConsultation(data);
export const update = (id: number, data: any) =>
  repository.updateConsultation(id, data);
