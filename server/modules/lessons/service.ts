import { deleteStoredFile } from "../../infrastructure/fileStorage";
import * as repository from "./repository";

export const getCourseLessons = repository.getCourseLessons;
export const getAllCourseLessons = repository.getAllCourseLessons;
export const createLesson = repository.createLesson;

export async function updateLesson(
  id: number,
  data: Parameters<typeof repository.updateLesson>[1]
) {
  const previous = await repository.getCourseLessonById(id);
  await repository.updateLesson(id, data);

  if (previous?.fileUrl && previous.fileUrl !== data.fileUrl) {
    await deleteStoredFile(previous.fileUrl);
  }
}

export async function deleteLesson(id: number) {
  const lesson = await repository.getCourseLessonById(id);
  await repository.deleteLesson(id);
  await deleteStoredFile(lesson?.fileUrl);
}
