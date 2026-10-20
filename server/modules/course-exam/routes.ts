import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const courseExamRouter = router({
  getByCourse: publicProcedure
    .input(schema.courseInput)
    .query(controller.getByCourse),
  submit: protectedProcedure
    .input(schema.submitInput)
    .mutation(controller.submit),
  getAttempt: protectedProcedure
    .input(schema.courseInput)
    .query(controller.getAttempt),
  upsert: adminProcedure.input(schema.upsertInput).mutation(controller.upsert),
});
