import { protectedProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import { enrollInput, progressInput, userInput } from "./schema";

export const enrollmentsRouter = router({
  myEnrollments: protectedProcedure
    .input(userInput.optional())
    .query(controller.myEnrollments),
  enroll: protectedProcedure.input(enrollInput).mutation(controller.enroll),
  updateProgress: protectedProcedure
    .input(progressInput)
    .mutation(controller.updateProgress),
});
