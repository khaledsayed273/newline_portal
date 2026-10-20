import * as repository from "./repository";
export const list = (departmentId?: number) =>
  repository.getQuizzes(departmentId);
export const listAll = () => repository.getAllQuizzes();
export const byId = (id: number) => repository.getQuizById(id);
export const create = (input: any) => repository.createQuiz(input);
export const update = (id: number, data: any) =>
  repository.updateQuiz(id, data);
export const remove = (id: number) => repository.deleteQuiz(id);
export const attempts = (userId: number, quizId: number) =>
  repository.getUserQuizAttempts(userId, quizId);
export const submit = (input: any) => repository.submitQuizAttempt(input);
