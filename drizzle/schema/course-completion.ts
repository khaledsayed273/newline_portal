import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

// ========== جدول شهادات الدورات ==========
export const courseCompletionCerts = mysqlTable("course_completion_certs", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  userId: int("userId").notNull(),
  fullName: varchar("fullName", { length: 256 }).notNull(),
  employeeId: varchar("employeeId", { length: 64 }).notNull(),
  courseName: varchar("courseName", { length: 512 }).notNull(),
  departmentName: varchar("departmentName", { length: 128 }),
  score: int("score").default(0).notNull(),
  certCode: varchar("certCode", { length: 64 }).unique().notNull(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
});
export type CourseCompletionCert = typeof courseCompletionCerts.$inferSelect;
