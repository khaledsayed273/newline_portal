import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول دروس الدورة (فيديوهات) ==========
export const courseLessons = mysqlTable("course_lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  videoUrl: text("videoUrl"),
  videoType: mysqlEnum("videoType", [
    "youtube",
    "vimeo",
    "direct",
    "embed",
  ]).default("youtube"),
  fileUrl: text("fileUrl"),
  fileType: varchar("fileType", { length: 16 }),
  duration: int("duration"), // بالثواني
  order: int("order").default(0),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CourseLesson = typeof courseLessons.$inferSelect;
export type InsertCourseLesson = typeof courseLessons.$inferInsert;
