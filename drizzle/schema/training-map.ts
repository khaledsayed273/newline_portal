import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  timestamp,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول الخارطة التدريبية ==========
export const trainingMapCourses = mysqlTable("training_map_courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  departmentId: int("departmentId"),
  departmentName: varchar("departmentName", { length: 128 }),
  pathName: varchar("pathName", { length: 128 }),
  targetRole: varchar("targetRole", { length: 256 }),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default(
    "beginner"
  ),
  duration: int("duration"), // بالدقائق
  isRequired: boolean("isRequired").default(true).notNull(),
  contentTypes: json("contentTypes").$type<string[]>(), // ["video","pdf","quiz","case"]
  source: varchar("source", { length: 256 }),
  sourceUrl: text("sourceUrl"),
  category: varchar("category", { length: 128 }),
  order: int("order").default(0),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainingMapCourse = typeof trainingMapCourses.$inferSelect;
export type InsertTrainingMapCourse = typeof trainingMapCourses.$inferInsert;
