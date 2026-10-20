export * from "./repository";
import * as repository from "./repository";

export const recordCourseView = (courseId: number, userId?: number) =>
  repository.recordCourseView(courseId, userId);
export const getCourseViewsCount = (courseId: number) =>
  repository.getCourseViewsCount(courseId);
