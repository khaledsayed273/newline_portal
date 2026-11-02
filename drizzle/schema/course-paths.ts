import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول مسارات الدورات (مسار أول / مسار ثاني) ==========
export const coursePaths = mysqlTable("course_paths", {
  id: int("id").autoincrement().primaryKey(),
  departmentId: int("departmentId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  order: int("order").default(0),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoursePath = typeof coursePaths.$inferSelect;
export type InsertCoursePath = typeof coursePaths.$inferInsert;

// ========== جدول ربط الدورات بالمسارات ==========
export const coursePathItems = mysqlTable("course_path_items", {
  id: int("id").autoincrement().primaryKey(),
  pathId: int("pathId").notNull(),
  courseId: int("courseId").notNull(),
  order: int("order").default(0),
});

export type CoursePathItem = typeof coursePathItems.$inferSelect;
export type InsertCoursePathItem = typeof coursePathItems.$inferInsert;

// ========== تقدم المستخدم في المسار ==========
export const pathProgress = mysqlTable("path_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  pathId: int("pathId").notNull(),
  completedCourses: int("completedCourses").default(0).notNull(),
  totalCourses: int("totalCourses").default(0).notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  certificateIssued: boolean("certificateIssued").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PathProgress = typeof pathProgress.$inferSelect;
