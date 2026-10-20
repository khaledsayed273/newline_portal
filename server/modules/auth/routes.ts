import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import { changePasswordInput, loginInput } from "./schema";
import * as controller from "./controller";

export const authRouter = router({
  me: publicProcedure.query(controller.me),
  login: publicProcedure.input(loginInput).mutation(controller.login),
  logout: publicProcedure.mutation(controller.logout),
  changePassword: protectedProcedure
    .input(changePasswordInput)
    .mutation(controller.updatePassword),
});
