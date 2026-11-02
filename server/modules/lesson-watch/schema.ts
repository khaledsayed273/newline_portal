import { z } from "zod";
export const progressInput = z.object({ lessonId: z.number() });
export const updateProgressInput = z.object({
  lessonId: z.number().int().positive(),
  courseId: z.number().int().positive(),
  watchedSeconds: z.number().finite().min(0),
  lastPositionSeconds: z.number().finite().min(0).optional(),
  totalSeconds: z.number().finite().positive(),
});
export const courseProgressInput = z.object({ courseId: z.number() });
export const markCompleteInput = z.object({
  lessonId: z.number(),
  courseId: z.number(),
});
