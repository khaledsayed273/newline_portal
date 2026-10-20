import * as service from "./service";
export const byCourse = ({ input }: any) =>
  service.getCourseLessons(input.courseId);
export const allByCourse = ({ input }: any) =>
  service.getAllCourseLessons(input.courseId);
export const create = ({ input }: any) => service.createLesson(input);
export const update = ({ input: { id, ...data } }: any) =>
  service.updateLesson(id, data);
export const remove = ({ input }: any) => service.deleteLesson(input.id);
