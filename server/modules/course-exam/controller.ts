import * as service from "./service";

export const getByCourse = ({ input }: any) =>
  service.getByCourse(input.courseId);
export const submit = ({ input, ctx }: any) =>
  service.submit({ ...input, userId: ctx.user.id });
export const getAttempt = ({ input, ctx }: any) =>
  service.getAttempt(input.courseId, ctx.user.id);
export const upsert = ({ input }: any) => service.upsert(input);
