import {
  boolean,
  int,
  json,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول اختبار الدورة (10 أسئلة متعددة) ==========
export const courseExams = mysqlTable("course_exams", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull().unique(),
  questions: json("questions").$type<CourseExamQuestion[]>().notNull(),
  passingScore: int("passingScore").default(70).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CourseExamQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index 0-3
};
export type CourseExam = typeof courseExams.$inferSelect;

// ========== جدول نتائج اختبار الدورة ==========
export const courseExamAttempts = mysqlTable("course_exam_attempts", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  userId: int("userId").notNull(),
  answers: json("answers").$type<number[]>().notNull(),
  score: int("score").default(0).notNull(), // 0-100
  isPassed: boolean("isPassed").default(false).notNull(),
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
});
export type CourseExamAttempt = typeof courseExamAttempts.$inferSelect;
