import { protectedProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const courseRatingRouter = router({
  submit: protectedProcedure
    .input(schema.submitInput)
    .mutation(controller.submit),
  getForCourse: protectedProcedure
    .input(schema.courseInput)
    .query(controller.getForCourse),
});
