import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول الاستشارات ==========
export const consultations = mysqlTable("consultations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  userName: varchar("userName", { length: 256 }),
  userEmail: varchar("userEmail", { length: 256 }),
  department: varchar("department", { length: 256 }),
  subject: varchar("subject", { length: 512 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "reviewed", "replied", "closed"])
    .default("new")
    .notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = typeof consultations.$inferInsert;
