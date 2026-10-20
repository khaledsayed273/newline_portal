import { z } from "zod";
export const getAllInput = z.object({
  departmentId: z.number().optional(),
  isRequired: z.boolean().optional(),
});
