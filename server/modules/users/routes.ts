import { adminProcedure, protectedProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const usersRouter = router({
  all: adminProcedure.query(controller.all),
  updateRole: adminProcedure
    .input(schema.updateRoleInput)
    .mutation(controller.updateRole),
  create: adminProcedure
    .input(schema.createUserInput)
    .mutation(controller.create),
  update: adminProcedure
    .input(schema.updateUserInput)
    .mutation(controller.update),
  updateProfile: protectedProcedure
    .input(schema.updateProfileInput)
    .mutation(controller.updateProfile),
  resetPassword: adminProcedure
    .input(schema.resetPasswordInput)
    .mutation(controller.resetPassword),
  delete: adminProcedure
    .input(schema.deleteUserInput)
    .mutation(controller.remove),
});
