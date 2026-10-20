import { publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const consultationsRouter = router({
  create: publicProcedure.input(schema.createInput).mutation(controller.create),
});
