import { z } from "zod";

export const mineInput = z.object({ userId: z.number().optional() }).optional();
export const createInput = z.object({
  subject: z.string().min(1),
  message: z.string().min(10),
  userName: z.string().optional(),
  userEmail: z.string().optional(),
  department: z.string().optional(),
  userId: z.number().optional(),
});
export const updateInput = z.object({
  id: z.number(),
  status: z
    .enum(["new", "reviewed", "replied", "closed"])
    .optional(),
  adminNotes: z.string().optional(),
});
