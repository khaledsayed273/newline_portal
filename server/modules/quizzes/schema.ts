import { z } from "zod";
export const listInput = z
  .object({ departmentId: z.number().optional() })
  .optional();
export const idInput = z.object({ id: z.number() });
export const quizInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  courseId: z.number().optional(),
  departmentId: z.number().optional(),
  questions: z.any().optional(),
  passingScore: z.number().optional(),
  timeLimit: z.number().optional(),
  isPublished: z.boolean().optional(),
});
export const attemptsInput = z.object({
  quizId: z.number(),
  userId: z.number().optional(),
});
export const submitInput = z.object({
  quizId: z.number(),
  answers: z.array(z.number()),
  score: z.number(),
  isPassed: z.boolean(),
  userId: z.number().optional(),
});
