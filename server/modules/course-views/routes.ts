import { publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import { courseIdInput, userCourseInput } from "./schema";

export const courseViewsRouter = router({
  record: publicProcedure.input(userCourseInput).mutation(controller.record),
  count: publicProcedure.input(courseIdInput).query(controller.count),
});
