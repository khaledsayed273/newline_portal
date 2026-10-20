import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const courseCertRouter = router({
  get: protectedProcedure.input(schema.courseInput).query(controller.get),
  issue: protectedProcedure.input(schema.issueInput).mutation(controller.issue),
  getByCode: publicProcedure
    .input(schema.codeInput)
    .query(controller.getByCode),
});
