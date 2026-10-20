import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import { createDepartmentInput, updateDepartmentInput } from "./schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "غير مصرح لك بهذا الإجراء",
    });
  return next({ ctx });
});

export const departmentsRouter = router({
  list: publicProcedure.query(controller.list),
  create: adminProcedure
    .input(createDepartmentInput)
    .mutation(controller.create),
  update: adminProcedure
    .input(updateDepartmentInput)
    .mutation(controller.update),
  delete: adminProcedure
    .input(updateDepartmentInput.pick({ id: true }))
    .mutation(controller.remove),
});
