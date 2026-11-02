import * as repository from "./repository";

export const get = async (userId: number) => {
  const [certs, enrollments] = await Promise.all([
    repository.getTraineeCerts(userId),
    repository.getUserEnrollments(userId),
  ]);
  const completedCourses = enrollments.filter(e => e.isCompleted).length;
  const inProgress = enrollments.filter(
    e => !e.isCompleted && (e.progress ?? 0) > 0
  ).length;
  const completionRate = enrollments.length
    ? Math.round(
        enrollments.reduce((sum, enrollment) => sum + (enrollment.progress ?? 0), 0) /
          enrollments.length
      )
    : 0;
  const points = completedCourses;
  const consultations = await repository.getTraineeConsultationsCount(userId);
  return {
    points,
    completedCourses,
    completionRate,
    certificates: certs.length,
    inProgress,
    consultations,
  };
};
