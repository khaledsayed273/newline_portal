import * as repository from "./repository";

export const submit = (input: any) => repository.submitCourseRating(input);
export const getForCourse = (courseId: number, userId: number) =>
  repository.getCourseRating(courseId, userId);
