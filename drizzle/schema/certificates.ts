import {
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول الشهادات ==========
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId"),
  trackId: int("trackId"),
  title: varchar("title", { length: 256 }).notNull(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  certificateCode: varchar("certificateCode", { length: 64 }).unique(),
  fileUrl: text("fileUrl"),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;
