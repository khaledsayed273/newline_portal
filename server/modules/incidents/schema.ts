import { z } from "zod";
export const mineInput = z.object({ userId: z.number().optional() }).optional();
export const createInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  userId: z.number().optional(),
});
export const updateInput = z.object({
  id: z.number(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  adminNotes: z.string().optional(),
  resolvedAt: z.date().optional(),
});
