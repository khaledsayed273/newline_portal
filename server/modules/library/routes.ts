import { publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const libraryRouter = router({
  getAll: publicProcedure.input(schema.getAllInput).query(controller.getAll),
  getCategories: publicProcedure.query(controller.getCategories),
  getSources: publicProcedure.query(controller.getSources),
  getStats: publicProcedure.query(controller.getStats),
});
