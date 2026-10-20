import { z } from "zod";
export const mineInput = z.object({ userId: z.number().optional() }).optional();
export const createInput = z.object({
  userId: z.number(),
  courseId: z.number().optional(),
  trackId: z.number().optional(),
  title: z.string().min(1),
  certificateCode: z.string().optional(),
  fileUrl: z.string().optional(),
});
