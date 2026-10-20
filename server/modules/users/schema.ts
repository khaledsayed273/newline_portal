import { z } from "zod";

export const updateRoleInput = z.object({
  userId: z.number(),
  role: z.enum(["user", "admin"]),
});

export const createUserInput = z.object({
  employeeNumber: z.string().min(1),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).optional(),
});

export const updateUserInput = z.object({
  userId: z.number(),
  employeeNumber: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export const resetPasswordInput = z.object({
  userId: z.number(),
  password: z.string().min(6),
});

export const deleteUserInput = z.object({ userId: z.number() });

export const updateProfileInput = z.object({
  fullName: z.string().min(1),
  employeeId: z.string().min(1),
});
