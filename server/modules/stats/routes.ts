import { publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";

export const statsRouter = router({
  overview: publicProcedure.query(controller.overview),
});
