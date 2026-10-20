import { adminProcedure, publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const coursesRouter = router({
  list: publicProcedure.input(schema.courseListInput).query(controller.list),
  listAll: adminProcedure.query(controller.listAll),
  byId: publicProcedure.input(schema.courseByIdInput).query(controller.byId),
  create: adminProcedure.input(schema.courseData).mutation(controller.create),
  update: adminProcedure
    .input(schema.courseUpdateInput)
    .mutation(controller.update),
  delete: adminProcedure
    .input(schema.courseDeleteInput)
    .mutation(controller.remove),
});
