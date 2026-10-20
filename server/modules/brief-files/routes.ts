import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import {
  briefFileIdInput,
  createBriefFileInput,
  departmentInput,
  updateBriefFileInput,
} from "./schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "غير مصرح لك بهذا الإجراء",
    });
  return next({ ctx });
});

export const briefFilesRouter = router({
  list: publicProcedure
    .input(departmentInput.optional())
    .query(controller.list),
  listAll: adminProcedure.query(controller.listAll),
  create: adminProcedure
    .input(createBriefFileInput)
    .mutation(controller.create),
  update: adminProcedure
    .input(updateBriefFileInput)
    .mutation(controller.update),
  delete: adminProcedure
    .input(briefFileIdInput.pick({ id: true }))
    .mutation(controller.remove),
});
