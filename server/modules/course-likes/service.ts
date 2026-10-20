import * as repository from "./repository";

export const toggleCourseLike = (courseId: number, userId: number) =>
  repository.toggleCourseLike(courseId, userId);
export const getCourseLikesCount = (courseId: number) =>
  repository.getCourseLikesCount(courseId);
export const isCourseLiked = (courseId: number, userId: number) =>
  repository.isCourseLiked(courseId, userId);
