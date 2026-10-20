import { z } from "zod";

export const courseData = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  departmentId: z.number().optional(),
  thumbnailUrl: z.string().optional(),
  duration: z.number().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  isPublished: z.boolean().optional(),
  order: z.number().optional(),
});

export const courseUpdateInput = courseData
  .partial()
  .extend({ id: z.number() });

export const courseListInput = z
  .object({ departmentId: z.number().optional() })
  .optional();

export const courseByIdInput = z.object({ id: z.number() });

export const courseDeleteInput = z.object({ id: z.number() });
