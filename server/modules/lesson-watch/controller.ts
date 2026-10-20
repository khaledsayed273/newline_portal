import * as service from "./service";

export const getProgress = ({ input, ctx }: any) =>
  service.getProgress(ctx.user.id, input.lessonId);
export const updateProgress = ({ input, ctx }: any) =>
  service.updateProgress(ctx.user.id, input);
export const getCourseProgress = ({ input, ctx }: any) =>
  service.getCourseProgress(ctx.user.id, input.courseId);
export const recalcPathProgress = ({ input, ctx }: any) =>
  service.recalcPathProgress(ctx.user.id, input.courseId);
export const markComplete = ({ input, ctx }: any) =>
  service.markComplete(ctx.user.id, input);
