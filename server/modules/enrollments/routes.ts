import { publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import { enrollInput, progressInput, userInput } from "./schema";

export const enrollmentsRouter = router({
  myEnrollments: publicProcedure
    .input(userInput.optional())
    .query(controller.myEnrollments),
  enroll: publicProcedure.input(enrollInput).mutation(controller.enroll),
  updateProgress: publicProcedure
    .input(progressInput)
    .mutation(controller.updateProgress),
});
