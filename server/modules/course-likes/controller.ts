import * as service from "./service";

export const toggle = ({ ctx, input }: any) =>
  service.toggleCourseLike(input.courseId, input.userId ?? ctx.user?.id ?? 0);
export const count = ({ input }: any) =>
  service.getCourseLikesCount(input.courseId);
export const isLiked = ({ ctx, input }: any) => {
  const uid = input.userId ?? ctx.user?.id;
  if (!uid) return false;
  return service.isCourseLiked(input.courseId, uid);
};
