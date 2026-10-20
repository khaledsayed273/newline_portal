export * from "./service";
import * as service from "./service";

export const record = ({ ctx, input }: any) =>
  service.recordCourseView(input.courseId, input.userId ?? ctx.user?.id);
export const count = ({ input }: any) =>
  service.getCourseViewsCount(input.courseId);
