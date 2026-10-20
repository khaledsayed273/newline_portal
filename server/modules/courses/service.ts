import { deleteStoredFiles } from "../../infrastructure/fileStorage";
import * as repository from "./repository";

export const getCourses = repository.getCourses;
export const getAllCourses = repository.getAllCourses;
export const getCourseById = repository.getCourseById;
export const createCourse = repository.createCourse;
export const updateCourse = repository.updateCourse;

export async function deleteCourse(id: number) {
  const lessons = await repository.getAllCourseLessons(id);
  await repository.deleteCourse(id);
  await deleteStoredFiles(lessons.map(lesson => lesson.fileUrl));
}
