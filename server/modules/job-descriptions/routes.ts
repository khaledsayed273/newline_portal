import { adminProcedure, publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";
export const jobDescriptionsRouter = router({
  list: publicProcedure.input(schema.listInput).query(controller.list),
  listAll: adminProcedure.query(controller.listAll),
  create: adminProcedure.input(schema.jobInput).mutation(controller.create),
  update: adminProcedure
    .input(schema.jobInput.extend({ id: schema.idInput.shape.id }))
    .mutation(controller.update),
  delete: adminProcedure.input(schema.idInput).mutation(controller.remove),
});
