import {
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول الإدارات/الأقسام ==========
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  nameEn: varchar("nameEn", { length: 128 }),
  description: text("description"),
  color: varchar("color", { length: 32 }),
  icon: varchar("icon", { length: 64 }),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;
