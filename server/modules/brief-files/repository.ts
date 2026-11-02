import { and, eq } from "drizzle-orm";
import {
  briefFiles,
  BriefFile,
  getDb,
  InsertBriefFile,
} from "../../infrastructure/database";

// ========== الملفات المختصرة ==========
export async function getBriefFiles(
  departmentId?: number
): Promise<BriefFile[]> {
  const db = await getDb();
  if (!db) return [];
  if (departmentId) {
    return db
      .select()
      .from(briefFiles)
      .where(
        and(
          eq(briefFiles.departmentId, departmentId),
          eq(briefFiles.isPublished, true)
        )
      )
      .orderBy(briefFiles.order);
  }
  return db
    .select()
    .from(briefFiles)
    .where(eq(briefFiles.isPublished, true))
    .orderBy(briefFiles.order);
}

export async function getAllBriefFiles(): Promise<BriefFile[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(briefFiles).orderBy(briefFiles.order);
}

export async function createBriefFile(
  data: InsertBriefFile
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(briefFiles).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateBriefFile(
  id: number,
  data: Partial<InsertBriefFile>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(briefFiles).set(data).where(eq(briefFiles.id, id));
}

export async function deleteBriefFile(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(briefFiles).where(eq(briefFiles.id, id));
}
