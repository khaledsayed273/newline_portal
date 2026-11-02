export {};
import { z } from "zod";

export const employeeDetailsInput = z.object({ userId: z.number() });
