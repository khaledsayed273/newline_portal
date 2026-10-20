import { protectedProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const lessonWatchRouter = router({
  getProgress: protectedProcedure
    .input(schema.progressInput)
    .query(controller.getProgress),
  updateProgress: protectedProcedure
    .input(schema.updateProgressInput)
    .mutation(controller.updateProgress),
  getCourseProgress: protectedProcedure
    .input(schema.courseProgressInput)
    .query(controller.getCourseProgress),
  recalcPathProgress: protectedProcedure
    .input(schema.courseProgressInput)
    .mutation(controller.recalcPathProgress),
  markLessonComplete: protectedProcedure
    .input(schema.markCompleteInput)
    .mutation(controller.markComplete),
});
