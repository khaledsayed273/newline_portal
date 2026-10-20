import * as repository from "./repository";

export const getByCourse = (courseId: number) =>
  repository.getCourseExam(courseId);
export const submit = (input: any) => repository.submitCourseExam(input);
export const getAttempt = (courseId: number, userId: number) =>
  repository.getCourseExamAttempt(courseId, userId);
export const upsert = (input: any) => repository.upsertCourseExam(input);
