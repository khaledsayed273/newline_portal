import { publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import { courseIdInput, userCourseInput } from "./schema";

export const courseLikesRouter = router({
  toggle: publicProcedure.input(userCourseInput).mutation(controller.toggle),
  count: publicProcedure.input(courseIdInput).query(controller.count),
  isLiked: publicProcedure.input(userCourseInput).query(controller.isLiked),
});
