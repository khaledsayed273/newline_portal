import * as repository from "./repository";

export const getStats = () => repository.getStats();
export const getEmployeeStats = () => repository.getEmployeeStats();
export const getEmployeeDetails = (userId: number) => repository.getEmployeeDetails(userId);
