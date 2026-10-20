import { z } from "zod";
export const courseInput = z.object({ courseId: z.number() });
export const issueInput = z.object({
  courseId: z.number(),
  courseName: z.string(),
  departmentName: z.string().optional(),
  score: z.number(),
});
export const codeInput = z.object({ certCode: z.string() });
