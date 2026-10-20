import { z } from "zod";
export const submitInput = z.object({
  courseId: z.number(),
  q1: z.number().min(1).max(5),
  q2: z.number().min(1).max(5),
  q3: z.number().min(1).max(5),
  q4: z.number().min(1).max(5),
  q5: z.number().min(1).max(5),
  comment: z.string().optional(),
});
export const courseInput = z.object({ courseId: z.number() });
