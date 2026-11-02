import { protectedProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import { courseIdInput, userCourseInput } from "./schema";

export const courseViewsRouter = router({
  record: protectedProcedure.input(userCourseInput).mutation(controller.record),
  count: protectedProcedure.input(courseIdInput).query(controller.count),
});
