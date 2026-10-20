import { z } from "zod";
export const createInput = z.object({
  subject: z.string().min(1),
  message: z.string().min(10),
  userName: z.string().optional(),
  userEmail: z.string().optional(),
  department: z.string().optional(),
});
