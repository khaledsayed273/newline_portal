import { z } from "zod";
export const courseInput = z.object({ courseId: z.number() });
export const submitInput = z.object({
  courseId: z.number(),
  answers: z.array(z.number()),
});
export const upsertInput = z.object({
  courseId: z.number(),
  questions: z
    .array(
      z.object({
        id: z.number(),
        question: z.string(),
        options: z.array(z.string()).length(4),
        correctAnswer: z.number().min(0).max(3),
      })
    )
    .length(10),
  passingScore: z.number().default(70),
});
