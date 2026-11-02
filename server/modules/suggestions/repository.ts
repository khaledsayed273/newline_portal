import { desc, eq } from "drizzle-orm";
import {
  getDb,
  InsertSuggestion,
  suggestions,
  Suggestion,
} from "../../infrastructure/database";

// ========== الاقتراحات ==========
export async function getUserSuggestions(
  userId: number
): Promise<Suggestion[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(suggestions)
    .where(eq(suggestions.userId, userId))
    .orderBy(desc(suggestions.createdAt));
}

export async function getAllSuggestions(): Promise<Suggestion[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(suggestions).orderBy(desc(suggestions.createdAt));
}

export async function createSuggestion(data: InsertSuggestion): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(suggestions).values(data);
}

export async function updateSuggestion(
  id: number,
  data: Partial<InsertSuggestion>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(suggestions).set(data).where(eq(suggestions.id, id));
}
