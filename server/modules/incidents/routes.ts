import { adminProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";
export const incidentsRouter = router({
  mine: adminProcedure.input(schema.mineInput).query(controller.mine),
  all: adminProcedure.query(controller.all),
  create: adminProcedure.input(schema.createInput).mutation(controller.create),
  update: adminProcedure.input(schema.updateInput).mutation(controller.update),
});
