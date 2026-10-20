import { z } from "zod";
export const mineInput = z.object({ userId: z.number().optional() }).optional();
export const createInput = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().optional(),
  userId: z.number().optional(),
});
export const updateInput = z.object({
  id: z.number(),
  status: z.enum(["new", "reviewed", "implemented", "rejected"]).optional(),
  adminNotes: z.string().optional(),
});
