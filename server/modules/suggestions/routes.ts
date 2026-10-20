import { adminProcedure, publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";
export const suggestionsRouter = router({
  mine: publicProcedure.input(schema.mineInput).query(controller.mine),
  all: adminProcedure.query(controller.all),
  create: publicProcedure.input(schema.createInput).mutation(controller.create),
  update: adminProcedure.input(schema.updateInput).mutation(controller.update),
});
