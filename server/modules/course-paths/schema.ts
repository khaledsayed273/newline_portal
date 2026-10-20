import { z } from "zod";

export const pathData = z.object({
  departmentId: z.number(),
  name: z.string().min(1),
  description: z.string().optional(),
  order: z.number().optional(),
  isPublished: z.boolean().optional(),
});

export const pathUpdateInput = pathData.partial().extend({ id: z.number() });

export const pathIdInput = z.object({ pathId: z.number() });

export const departmentInput = z.object({ departmentId: z.number() });

export const progressInput = z.object({
  pathId: z.number(),
  completedCourses: z.number(),
  totalCourses: z.number(),
});

export const addCourseInput = z.object({
  pathId: z.number(),
  courseId: z.number(),
  order: z.number().optional(),
});

export const removeCourseInput = z.object({
  pathId: z.number(),
  courseId: z.number(),
});

export const pathDeleteInput = z.object({ id: z.number() });
