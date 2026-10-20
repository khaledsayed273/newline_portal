import { int, mysqlTable, timestamp } from "drizzle-orm/mysql-core";

// ========== جدول الإعجابات على الدورات ==========
export const courseLikes = mysqlTable("course_likes", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CourseLike = typeof courseLikes.$inferSelect;
export type InsertCourseLike = typeof courseLikes.$inferInsert;

// ========== جدول مشاهدات الدورات ==========
export const courseViews = mysqlTable("course_views", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  userId: int("userId"),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});

export type CourseView = typeof courseViews.$inferSelect;
export type InsertCourseView = typeof courseViews.$inferInsert;
