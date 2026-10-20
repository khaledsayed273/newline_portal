import {
  boolean,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول الوصف الوظيفي ==========
export const jobDescriptions = mysqlTable("job_descriptions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  departmentId: int("departmentId"),
  responsibilities: json("responsibilities").$type<string[]>(),
  requirements: json("requirements").$type<string[]>(),
  fileUrl: text("fileUrl"),
  isPublished: boolean("isPublished").default(true).notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobDescription = typeof jobDescriptions.$inferSelect;
export type InsertJobDescription = typeof jobDescriptions.$inferInsert;
