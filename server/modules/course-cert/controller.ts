import * as service from "./service";

export const get = ({ input, ctx }: any) =>
  service.get(input.courseId, ctx.user.id);
export const issue = ({ input, ctx }: any) =>
  service.issue({
    ...input,
    userId: ctx.user.id,
    fullName: ctx.user.name || ctx.user.employeeNumber,
    employeeId: ctx.user.employeeNumber,
  });
export const getByCode = ({ input }: any) => service.getByCode(input.certCode);
