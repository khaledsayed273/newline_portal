export * from "./service";
import * as service from "./service";

export const list = ({ input }: any) => service.getTracks(input?.departmentId);
export const listAll = () => service.getAllTracks();
export const byId = ({ input }: any) => service.getTrackById(input.id);
export const courses = ({ input }: any) =>
  service.getTrackCourses(input.trackId);
export const create = ({ input }: any) => service.createTrack(input);
export const update = ({ input: { id, ...data } }: any) =>
  service.updateTrack(id, data);
export const remove = ({ input }: any) => service.deleteTrack(input.id);
export const addCourse = ({ input }: any) => service.addCourseToTrack(input);
export const removeCourse = ({ input }: any) =>
  service.removeCourseFromTrack(input.trackId, input.courseId);
