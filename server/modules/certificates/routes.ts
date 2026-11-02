import { adminProcedure, protectedProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";
export const certificatesRouter = router({
  mine: protectedProcedure.input(schema.mineInput).query(controller.mine),
  all: adminProcedure.query(controller.all),
  allForAdmin: adminProcedure.query(controller.allForAdmin),
  employee: adminProcedure.input(schema.employeeInput).query(controller.employee),
  create: adminProcedure.input(schema.createInput).mutation(controller.create),
});
