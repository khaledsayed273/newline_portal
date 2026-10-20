import { adminProcedure, publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const lessonsRouter = router({
  byCourse: publicProcedure
    .input(schema.lessonByCourseInput)
    .query(controller.byCourse),
  allByCourse: adminProcedure
    .input(schema.lessonByCourseInput)
    .query(controller.allByCourse),
  create: adminProcedure.input(schema.lessonData).mutation(controller.create),
  update: adminProcedure
    .input(schema.lessonUpdateInput)
    .mutation(controller.update),
  delete: adminProcedure
    .input(schema.lessonDeleteInput)
    .mutation(controller.remove),
});
