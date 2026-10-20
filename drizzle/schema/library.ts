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

// ========== جدول المكتبة التدريبية الخارجية ==========
export const libraryResources = mysqlTable("library_resources", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  url: text("url").notNull(),
  source: varchar("source", { length: 128 }).notNull(),
  sourceName: varchar("sourceName", { length: 256 }),
  category: varchar("category", { length: 128 }).notNull(),
  subcategory: varchar("subcategory", { length: 128 }),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default(
    "beginner"
  ),
  duration: int("duration"), // بالدقائق
  contentType: mysqlEnum("contentType", [
    "video",
    "article",
    "pdf",
    "course",
    "quiz",
    "tool",
  ]).default("video"),
  isFree: boolean("isFree").default(true).notNull(),
  language: varchar("language", { length: 8 }).default("ar"),
  tags: json("tags").$type<string[]>(),
  isPublished: boolean("isPublished").default(true).notNull(),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LibraryResource = typeof libraryResources.$inferSelect;
export type InsertLibraryResource = typeof libraryResources.$inferInsert;
