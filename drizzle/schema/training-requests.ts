import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول طلبات التدريب ==========
export const trainingRequests = mysqlTable("training_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  requestedDate: timestamp("requestedDate"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"])
    .default("pending")
    .notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrainingRequest = typeof trainingRequests.$inferSelect;
export type InsertTrainingRequest = typeof trainingRequests.$inferInsert;
