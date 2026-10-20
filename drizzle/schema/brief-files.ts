import {
  boolean,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول الملفات المختصرة ==========
export const briefFiles = mysqlTable("brief_files", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  departmentId: int("departmentId"),
  fileUrl: text("fileUrl"),
  fileType: varchar("fileType", { length: 32 }),
  fileSize: int("fileSize"),
  thumbnailUrl: text("thumbnailUrl"),
  isPublished: boolean("isPublished").default(false).notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BriefFile = typeof briefFiles.$inferSelect;
export type InsertBriefFile = typeof briefFiles.$inferInsert;
