import * as repository from "./repository";

export const get = (courseId: number, userId: number) =>
  repository.getCourseCompletionCert(courseId, userId);
export const issue = (input: any) =>
  repository.issueCourseCompletionCert(input);
export const getByCode = (certCode: string) =>
  repository.getCourseCompletionCertByCode(certCode);
