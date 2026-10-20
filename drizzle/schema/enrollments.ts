import {
  boolean,
  int,
  json,
  mysqlTable,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ========== جدول تسجيلات المتدربين في الدورات ==========
export const enrollments = mysqlTable(
  "enrollments",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    courseId: int("courseId").notNull(),
    progress: int("progress").default(0), // نسبة مئوية 0-100
    completedLessons: json("completedLessons").$type<number[]>(),
    isCompleted: boolean("isCompleted").default(false).notNull(),
    enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  t => [
    uniqueIndex("enrollments_userId_courseId_unique").on(t.userId, t.courseId),
  ]
);

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;
