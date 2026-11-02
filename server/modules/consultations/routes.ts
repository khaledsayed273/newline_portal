import { protectedProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const consultationsRouter = router({
  create: protectedProcedure.input(schema.createInput).mutation(controller.create),
});
