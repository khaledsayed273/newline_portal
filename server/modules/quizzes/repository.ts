import { and, desc, eq } from "drizzle-orm";
import {
  getDb,
  InsertQuiz,
  InsertQuizAttempt,
  quizAttempts,
  quizzes,
  Quiz,
  QuizAttempt,
} from "../../infrastructure/database";

// ========== الاختبارات ==========
export async function getQuizzes(departmentId?: number): Promise<Quiz[]> {
  const db = await getDb();
  if (!db) return [];
  if (departmentId) {
    return db
      .select()
      .from(quizzes)
      .where(
        and(
          eq(quizzes.departmentId, departmentId),
          eq(quizzes.isPublished, true)
        )
      );
  }
  return db.select().from(quizzes).where(eq(quizzes.isPublished, true));
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
}

export async function getQuizById(id: number): Promise<Quiz | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, id))
    .limit(1);
  return result[0];
}

export async function createQuiz(data: InsertQuiz): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(quizzes).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateQuiz(
  id: number,
  data: Partial<InsertQuiz>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(quizzes).set(data).where(eq(quizzes.id, id));
}

export async function deleteQuiz(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(quizzes).where(eq(quizzes.id, id));
}

export async function getUserQuizAttempts(
  userId: number,
  quizId: number
): Promise<QuizAttempt[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(quizAttempts)
    .where(
      and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId))
    )
    .orderBy(desc(quizAttempts.attemptedAt));
}

export async function submitQuizAttempt(
  data: InsertQuizAttempt
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(quizAttempts).values(data);
  return { id: Number(result[0].insertId) };
}
