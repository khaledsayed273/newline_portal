import { adminProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const statsRouter = router({
  overview: adminProcedure.query(controller.overview),
  employees: adminProcedure.query(controller.employees),
  employeeDetails: adminProcedure
    .input(schema.employeeDetailsInput)
    .query(controller.employeeDetails),
});
