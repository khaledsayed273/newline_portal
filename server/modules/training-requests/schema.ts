import { z } from "zod";
export const mineInput = z.object({ userId: z.number().optional() }).optional();
export const createInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  requestedDate: z.date().optional(),
  userId: z.number().optional(),
});
export const updateInput = z.object({
  id: z.number(),
  status: z.enum(["pending", "approved", "rejected", "completed"]).optional(),
  adminNotes: z.string().optional(),
});
