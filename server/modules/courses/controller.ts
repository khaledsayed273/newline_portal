import * as service from "./service";
export const list = ({ input }: any) => service.getCourses(input?.departmentId);
export const listAll = () => service.getAllCourses();
export const byId = ({ input }: any) => service.getCourseById(input.id);
export const create = ({ input }: any) => service.createCourse(input);
export const update = ({ input: { id, ...data } }: any) =>
  service.updateCourse(id, data);
export const remove = ({ input }: any) => service.deleteCourse(input.id);
