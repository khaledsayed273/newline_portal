import { protectedProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";

export const traineeStatsRouter = router({
  get: protectedProcedure.query(controller.get),
});
