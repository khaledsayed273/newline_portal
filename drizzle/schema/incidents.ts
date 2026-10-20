import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول التعثرات ==========
export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 128 }),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"])
    .default("open")
    .notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"])
    .default("medium")
    .notNull(),
  adminNotes: text("adminNotes"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;
