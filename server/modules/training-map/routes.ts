import { publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const trainingMapRouter = router({
  getAll: publicProcedure.input(schema.getAllInput).query(controller.getAll),
  getStats: publicProcedure.query(controller.getStats),
});
