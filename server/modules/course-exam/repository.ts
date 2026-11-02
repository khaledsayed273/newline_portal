import { and, desc, eq } from "drizzle-orm";
import {
  courseExamAttempts,
  courseExams,
  getDb,
} from "../../infrastructure/database";

// ========== اختبار الدورة ==========
export async function getCourseExam(courseId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(courseExams)
    .where(eq(courseExams.courseId, courseId))
    .limit(1);
  if (!row) return null;
  return {
    ...row,
    questions:
      typeof row.questions === "string"
        ? JSON.parse(row.questions)
        : row.questions,
  };
}

export async function submitCourseExam(input: {
  courseId: number;
  userId: number;
  answers: number[];
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // جلب الاختبار
  const [exam] = await db
    .select()
    .from(courseExams)
    .where(eq(courseExams.courseId, input.courseId))
    .limit(1);
  if (!exam) throw new Error("لا يوجد اختبار لهذه الدورة");
  const questions =
    typeof exam.questions === "string"
      ? JSON.parse(exam.questions)
      : exam.questions;
  // حساب الدرجة
  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    const correctAns =
      questions[i].correctAnswer !== undefined
        ? questions[i].correctAnswer
        : questions[i].correctIndex;
    if (Number(input.answers[i]) === Number(correctAns)) correct++;
  }
  const score = correct * 10; // كل سؤال 10 درجات
  const isPassed = score >= (exam.passingScore ?? 70);
  // حذف المحاولة القديمة وإضافة الجديدة
  await db
    .delete(courseExamAttempts)
    .where(
      and(
        eq(courseExamAttempts.courseId, input.courseId),
        eq(courseExamAttempts.userId, input.userId)
      )
    );
  await db.insert(courseExamAttempts).values({
    courseId: input.courseId,
    userId: input.userId,
    answers: input.answers,
    score,
    isPassed,
  });
  return { score, isPassed, correct, total: questions.length };
}

export async function getCourseExamAttempt(courseId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(courseExamAttempts)
    .where(
      and(
        eq(courseExamAttempts.courseId, courseId),
        eq(courseExamAttempts.userId, userId)
      )
    )
    .orderBy(desc(courseExamAttempts.attemptedAt))
    .limit(1);
  if (!row) return null;
  return {
    ...row,
    answers:
      typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers,
  };
}

export async function upsertCourseExam(input: {
  courseId: number;
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  passingScore: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db
    .insert(courseExams)
    .values(input)
    .onDuplicateKeyUpdate({
      set: {
        questions: input.questions,
        passingScore: input.passingScore,
      },
    });
  return { success: true };
}
