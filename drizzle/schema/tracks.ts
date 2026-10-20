import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول المسارات التدريبية ==========
export const tracks = mysqlTable("tracks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  departmentId: int("departmentId"),
  thumbnailUrl: text("thumbnailUrl"),
  targetRole: varchar("targetRole", { length: 128 }),
  isPublished: boolean("isPublished").default(false).notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;

// ========== جدول ربط المسارات بالدورات ==========
export const trackCourses = mysqlTable("track_courses", {
  id: int("id").autoincrement().primaryKey(),
  trackId: int("trackId").notNull(),
  courseId: int("courseId").notNull(),
  order: int("order").default(0),
  isRequired: boolean("isRequired").default(true).notNull(),
});

export type TrackCourse = typeof trackCourses.$inferSelect;
export type InsertTrackCourse = typeof trackCourses.$inferInsert;
