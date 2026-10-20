export * from "./repository";
import * as repository from "./repository";

export const getTracks = (departmentId?: number) =>
  repository.getTracks(departmentId);
export const getAllTracks = () => repository.getAllTracks();
export const getTrackById = (id: number) => repository.getTrackById(id);
export const getTrackCourses = (trackId: number) =>
  repository.getTrackCourses(trackId);
export const createTrack = (data: any) => repository.createTrack(data);
export const updateTrack = (id: number, data: any) =>
  repository.updateTrack(id, data);
export const deleteTrack = (id: number) => repository.deleteTrack(id);
export const addCourseToTrack = (data: any) =>
  repository.addCourseToTrack(data);
export const removeCourseFromTrack = (trackId: number, courseId: number) =>
  repository.removeCourseFromTrack(trackId, courseId);
