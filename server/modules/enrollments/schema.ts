export { z } from "zod";
import { z } from "zod";

export const userInput = z.object({ userId: z.number().optional() });
export const enrollInput = z.object({
  courseId: z.number(),
  userId: z.number().optional(),
});
export const progressInput = z.object({
  courseId: z.number(),
  progress: z.number().min(0).max(100),
  completedLessons: z.array(z.number()),
  userId: z.number().optional(),
});
