export { z } from "zod";
import { z } from "zod";

export const departmentInput = z.object({
  departmentId: z.number().optional(),
});
export const trackIdInput = z.object({
  id: z.number(),
  trackId: z.number(),
  departmentId: z.number(),
  courseId: z.number(),
});
export const createTrackInput = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  departmentId: z.number().optional(),
  thumbnailUrl: z.string().optional(),
  targetRole: z.string().optional(),
  isPublished: z.boolean().optional(),
  order: z.number().optional(),
});
export const updateTrackInput = createTrackInput
  .partial()
  .extend({ id: z.number() });
export const trackCourseInput = z.object({
  trackId: z.number(),
  courseId: z.number(),
  order: z.number().optional(),
  isRequired: z.boolean().optional(),
});
