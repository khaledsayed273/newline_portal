import * as repository from "./repository";
export const mine = (userId: number) => repository.getUserIncidents(userId);
export const all = () => repository.getAllIncidents();
export const create = (input: any) => repository.createIncident(input);
export const update = (id: number, data: any) =>
  repository.updateIncident(id, data);
