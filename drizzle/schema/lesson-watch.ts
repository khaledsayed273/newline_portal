import {
  boolean,
  int,
  mysqlTable,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

// ========== جدول تتبع مشاهدة الدروس (مؤشر الإكمال الصارم) ==========
export const lessonWatchProgress = mysqlTable(
  "lesson_watch_progress",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    lessonId: int("lessonId").notNull(),
    courseId: int("courseId").notNull(),
    watchedSeconds: int("watchedSeconds").default(0).notNull(),
    totalSeconds: int("totalSeconds").default(0).notNull(),
    isCompleted: boolean("isCompleted").default(false).notNull(),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  t => [
    uniqueIndex("lesson_watch_progress_userId_lessonId_unique").on(
      t.userId,
      t.lessonId
    ),
  ]
);
export type LessonWatchProgress = typeof lessonWatchProgress.$inferSelect;
export type InsertLessonWatchProgress = typeof lessonWatchProgress.$inferInsert;
