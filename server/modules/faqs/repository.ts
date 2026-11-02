import { and, eq } from "drizzle-orm";
import { faqs, FAQ, getDb, InsertFAQ } from "../../infrastructure/database";

// ========== الأسئلة الشائعة ==========
export async function getFAQs(departmentId?: number): Promise<FAQ[]> {
  const db = await getDb();
  if (!db) return [];
  if (departmentId) {
    return db
      .select()
      .from(faqs)
      .where(
        and(eq(faqs.departmentId, departmentId), eq(faqs.isPublished, true))
      )
      .orderBy(faqs.order);
  }
  return db
    .select()
    .from(faqs)
    .where(eq(faqs.isPublished, true))
    .orderBy(faqs.order);
}

export async function getAllFAQs(): Promise<FAQ[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(faqs).orderBy(faqs.order);
}

export async function createFAQ(data: InsertFAQ): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(faqs).values(data);
}

export async function updateFAQ(
  id: number,
  data: Partial<InsertFAQ>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(faqs).set(data).where(eq(faqs.id, id));
}

export async function deleteFAQ(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(faqs).where(eq(faqs.id, id));
}
