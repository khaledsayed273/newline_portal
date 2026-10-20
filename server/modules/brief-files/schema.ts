export { z } from "zod";
import { z } from "zod";

export const departmentInput = z.object({
  departmentId: z.number().optional(),
});
export const briefFileIdInput = z.object({
  id: z.number(),
  departmentId: z.number(),
});
export const createBriefFileInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  departmentId: z.number().optional(),
  fileUrl: z.string().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
  thumbnailUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
  order: z.number().optional(),
});
export const updateBriefFileInput = createBriefFileInput
  .partial()
  .extend({ id: z.number() });
