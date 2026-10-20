import * as repository from "./repository";
export const mine = (userId: number) => repository.getUserSuggestions(userId);
export const all = () => repository.getAllSuggestions();
export const create = (input: any) => repository.createSuggestion(input);
export const update = (id: number, data: any) =>
  repository.updateSuggestion(id, data);
