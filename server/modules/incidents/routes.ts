import { adminProcedure, protectedProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";
export const incidentsRouter = router({
  mine: protectedProcedure.input(schema.mineInput).query(controller.mine),
  all: adminProcedure.query(controller.all),
  create: protectedProcedure.input(schema.createInput).mutation(controller.create),
  update: adminProcedure.input(schema.updateInput).mutation(controller.update),
});
