import { z } from "zod";
export const listInput = z
  .object({ departmentId: z.number().optional() })
  .optional();
export const faqInput = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
  departmentId: z.number().optional(),
  order: z.number().optional(),
  isPublished: z.boolean().optional(),
});
export const idInput = z.object({ id: z.number() });
