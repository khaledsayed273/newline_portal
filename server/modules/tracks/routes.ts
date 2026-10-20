import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc";
import * as controller from "./controller";
import {
  createTrackInput,
  departmentInput,
  trackCourseInput,
  trackIdInput,
  updateTrackInput,
} from "./schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "غير مصرح لك بهذا الإجراء",
    });
  return next({ ctx });
});

export const tracksRouter = router({
  list: publicProcedure
    .input(departmentInput.optional())
    .query(controller.list),
  listAll: adminProcedure.query(controller.listAll),
  byId: publicProcedure
    .input(trackIdInput.pick({ id: true }))
    .query(controller.byId),
  courses: publicProcedure
    .input(trackIdInput.pick({ trackId: true }))
    .query(controller.courses),
  create: adminProcedure.input(createTrackInput).mutation(controller.create),
  update: adminProcedure.input(updateTrackInput).mutation(controller.update),
  delete: adminProcedure
    .input(trackIdInput.pick({ id: true }))
    .mutation(controller.remove),
  addCourse: adminProcedure
    .input(
      trackCourseInput.extend({ isRequired: trackCourseInput.shape.isRequired })
    )
    .mutation(controller.addCourse),
  removeCourse: adminProcedure
    .input(trackCourseInput.pick({ trackId: true, courseId: true }))
    .mutation(controller.removeCourse),
});
