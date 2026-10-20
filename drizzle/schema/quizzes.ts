import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ========== جدول الاختبارات ==========
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  courseId: int("courseId"),
  departmentId: int("departmentId"),
  questions: json("questions").$type<QuizQuestion[]>(),
  passingScore: int("passingScore").default(60),
  timeLimit: int("timeLimit"), // بالدقائق
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

// ========== جدول نتائج الاختبارات ==========
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  quizId: int("quizId").notNull(),
  answers: json("answers").$type<number[]>(),
  score: int("score").default(0),
  isPassed: boolean("isPassed").default(false).notNull(),
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;
