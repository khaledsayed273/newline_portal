import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول الدورات التدريبية ==========
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  departmentId: int("departmentId"),
  thumbnailUrl: text("thumbnailUrl"),
  duration: int("duration"), // بالدقائق
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default(
    "beginner"
  ),
  isPublished: boolean("isPublished").default(false).notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;
