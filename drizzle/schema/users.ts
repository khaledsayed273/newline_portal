import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول المستخدمين ==========
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  employeeNumber: varchar("employeeNumber", { length: 64 }).notNull().unique(),
  name: text("name"),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  department: varchar("department", { length: 128 }),
  jobTitle: varchar("jobTitle", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
