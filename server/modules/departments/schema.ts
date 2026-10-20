export { z } from "zod";
import { z } from "zod";

export const createDepartmentInput = z.object({
  name: z.string().min(1),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().optional(),
});
export const updateDepartmentInput = createDepartmentInput
  .partial()
  .extend({ id: z.number() });
