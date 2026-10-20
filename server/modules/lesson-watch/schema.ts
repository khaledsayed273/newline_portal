import { z } from "zod";
export const progressInput = z.object({ lessonId: z.number() });
export const updateProgressInput = z.object({
  lessonId: z.number(),
  courseId: z.number(),
  watchedSeconds: z.number(),
  totalSeconds: z.number(),
});
export const courseProgressInput = z.object({ courseId: z.number() });
export const markCompleteInput = z.object({
  lessonId: z.number(),
  courseId: z.number(),
});
