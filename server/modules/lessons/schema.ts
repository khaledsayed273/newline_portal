import { z } from "zod";

export const lessonData = z.object({
  courseId: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  videoUrl: z.string().url().nullable().optional(),
  videoType: z.enum(["youtube", "vimeo", "direct", "embed"]).optional(),
  fileUrl: z.string().nullable().optional(),
  fileType: z.string().nullable().optional(),
  duration: z.number().optional(),
  order: z.number().optional(),
  isPublished: z.boolean().optional(),
});

export const lessonUpdateInput = lessonData
  .partial()
  .extend({ id: z.number() });

export const lessonByCourseInput = z.object({ courseId: z.number() });

export const lessonDeleteInput = z.object({ id: z.number() });
