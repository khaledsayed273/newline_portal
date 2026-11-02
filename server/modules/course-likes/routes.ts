import { protectedProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import { courseIdInput, userCourseInput } from "./schema";

export const courseLikesRouter = router({
  toggle: protectedProcedure.input(userCourseInput).mutation(controller.toggle),
  count: protectedProcedure.input(courseIdInput).query(controller.count),
  isLiked: protectedProcedure.input(userCourseInput).query(controller.isLiked),
});
