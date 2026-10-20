import { adminProcedure, publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";
export const quizzesRouter = router({
  list: publicProcedure.input(schema.listInput).query(controller.list),
  listAll: adminProcedure.query(controller.listAll),
  byId: publicProcedure.input(schema.idInput).query(controller.byId),
  create: adminProcedure.input(schema.quizInput).mutation(controller.create),
  update: adminProcedure
    .input(schema.quizInput.extend({ id: schema.idInput.shape.id }))
    .mutation(controller.update),
  delete: adminProcedure.input(schema.idInput).mutation(controller.remove),
  myAttempts: publicProcedure
    .input(schema.attemptsInput)
    .query(controller.myAttempts),
  submit: publicProcedure.input(schema.submitInput).mutation(controller.submit),
});
