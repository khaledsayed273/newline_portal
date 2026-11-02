import { protectedProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const trainingMapRouter = router({
  getAll: protectedProcedure.input(schema.getAllInput).query(controller.getAll),
  getStats: protectedProcedure.query(controller.getStats),
});
