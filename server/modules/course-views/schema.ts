export { z } from "zod";
import { z } from "zod";

export const courseIdInput = z.object({ courseId: z.number() });
export const userCourseInput = courseIdInput.extend({
  userId: z.number().optional(),
});
