import * as service from "./service";

export const submit = ({ input, ctx }: any) =>
  service.submit({ ...input, userId: ctx.user.id });
export const getForCourse = ({ input, ctx }: any) =>
  service.getForCourse(input.courseId, ctx.user.id);
