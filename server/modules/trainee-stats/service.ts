import * as repository from "./repository";

export const get = async (userId: number) => {
  const certs = await repository.getTraineeCerts(userId);
  const completedCourses = certs.length;
  const points = completedCourses;
  const completionRate = Math.min(completedCourses * 5, 100);
  const consultations = await repository.getTraineeConsultationsCount(userId);
  return {
    points,
    completedCourses,
    completionRate,
    certificates: completedCourses,
    consultations,
  };
};
