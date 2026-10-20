import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../../_core/trpc";
import * as controller from "./controller";
import * as schema from "./schema";

export const coursePathsRouter = router({
  listAll: adminProcedure.query(controller.listAll),
  byDepartment: publicProcedure
    .input(schema.departmentInput)
    .query(controller.byDepartment),
  withCourses: publicProcedure
    .input(schema.pathIdInput)
    .query(controller.withCourses),
  byDepartmentWithProgress: protectedProcedure
    .input(schema.departmentInput)
    .query(controller.withProgress),
  getProgress: protectedProcedure
    .input(schema.pathIdInput)
    .query(controller.progress),
  updateProgress: protectedProcedure
    .input(schema.progressInput)
    .mutation(controller.updateProgress),
  issueCertificate: protectedProcedure
    .input(schema.pathIdInput)
    .mutation(controller.issueCertificate),
  create: adminProcedure.input(schema.pathData).mutation(controller.create),
  update: adminProcedure
    .input(schema.pathUpdateInput)
    .mutation(controller.update),
  addCourse: adminProcedure
    .input(schema.addCourseInput)
    .mutation(controller.addCourse),
  removeCourse: adminProcedure
    .input(schema.removeCourseInput)
    .mutation(controller.removeCourse),
  delete: adminProcedure
    .input(schema.pathDeleteInput)
    .mutation(controller.remove),
});
