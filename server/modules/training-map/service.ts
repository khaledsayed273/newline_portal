import * as repository from "./repository";

export const getAll = (departmentId?: number, isRequired?: boolean) =>
  repository.getTrainingMapCourses(departmentId, isRequired);
export const getStats = () => repository.getTrainingMapStats();
