import { int, mysqlTable, text, timestamp } from "drizzle-orm/mysql-core";

// ========== جدول تقييم انطباع الدورة (5 أسئلة) ==========
export const courseRatings = mysqlTable("course_ratings", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  userId: int("userId").notNull(),
  q1: int("q1").notNull(), // جودة المحتوى (1-5)
  q2: int("q2").notNull(), // وضوح الشرح (1-5)
  q3: int("q3").notNull(), // الاستفادة العملية (1-5)
  q4: int("q4").notNull(), // توصية للزملاء (1-5)
  q5: int("q5").notNull(), // التقييم العام (1-5)
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CourseRating = typeof courseRatings.$inferSelect;
export type InsertCourseRating = typeof courseRatings.$inferInsert;
