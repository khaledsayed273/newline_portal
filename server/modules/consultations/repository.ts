import { desc, eq } from "drizzle-orm";
import {
  consultations,
  Consultation,
  getDb,
  InsertConsultation,
} from "../../infrastructure/database";

// ========== الاستشارات ==========
export async function getUserConsultations(
  userId: number
): Promise<Consultation[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(consultations)
    .where(eq(consultations.userId, userId))
    .orderBy(desc(consultations.createdAt));
}

export async function getAllConsultations(): Promise<Consultation[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(consultations).orderBy(desc(consultations.createdAt));
}

export async function createConsultation(
  data: InsertConsultation
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(consultations).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateConsultation(
  id: number,
  data: Partial<InsertConsultation>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(consultations).set(data).where(eq(consultations.id, id));
}
