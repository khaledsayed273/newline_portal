import * as service from "./service";

export const toggle = ({ ctx, input }: any) =>
  service.toggleCourseLike(input.courseId, ctx.user.id);
export const count = ({ input }: any) =>
  service.getCourseLikesCount(input.courseId);
export const isLiked = ({ ctx, input }: any) => {
  return service.isCourseLiked(input.courseId, ctx.user.id);
};
