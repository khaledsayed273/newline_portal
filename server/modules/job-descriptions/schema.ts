import { z } from "zod";
export const listInput = z
  .object({ departmentId: z.number().optional() })
  .optional();
export const idInput = z.object({ id: z.number() });
export const jobInput = z.object({
  title: z.string().min(1),
  departmentId: z.number().optional(),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  fileUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
  order: z.number().optional(),
});
