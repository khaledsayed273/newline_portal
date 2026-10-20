import { adminProcedure, publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";
export const certificatesRouter = router({
  mine: publicProcedure.input(schema.mineInput).query(controller.mine),
  all: adminProcedure.query(controller.all),
  create: adminProcedure.input(schema.createInput).mutation(controller.create),
});
