import { z } from "zod";

export const loginInput = z.object({
  employeeNumber: z.string().min(1),
  password: z.string().min(1),
});
export const changePasswordInput = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});
