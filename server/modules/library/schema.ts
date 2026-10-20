import { z } from "zod";
export const getAllInput = z.object({
  category: z.string().optional(),
  source: z.string().optional(),
  search: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});
