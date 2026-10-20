import * as repository from "./repository";
export const mine = (userId: number) =>
  repository.getUserTrainingRequests(userId);
export const all = () => repository.getAllTrainingRequests();
export const create = (input: any) => repository.createTrainingRequest(input);
export const update = (id: number, data: any) =>
  repository.updateTrainingRequest(id, data);
