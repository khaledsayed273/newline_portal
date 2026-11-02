import { desc, eq } from "drizzle-orm";
import {
  getDb,
  InsertTrainingRequest,
  trainingRequests,
  TrainingRequest,
} from "../../infrastructure/database";

// ========== طلبات التدريب ==========
export async function getUserTrainingRequests(
  userId: number
): Promise<TrainingRequest[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(trainingRequests)
    .where(eq(trainingRequests.userId, userId))
    .orderBy(desc(trainingRequests.createdAt));
}

export async function getAllTrainingRequests(): Promise<TrainingRequest[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(trainingRequests)
    .orderBy(desc(trainingRequests.createdAt));
}

export async function createTrainingRequest(
  data: InsertTrainingRequest
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(trainingRequests).values(data);
}

export async function updateTrainingRequest(
  id: number,
  data: Partial<InsertTrainingRequest>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(trainingRequests)
    .set(data)
    .where(eq(trainingRequests.id, id));
}
