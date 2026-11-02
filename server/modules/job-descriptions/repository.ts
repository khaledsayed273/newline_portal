import { and, eq } from "drizzle-orm";
import {
  getDb,
  InsertJobDescription,
  jobDescriptions,
  JobDescription,
} from "../../infrastructure/database";

// ========== الوصف الوظيفي ==========
export async function getJobDescriptions(
  departmentId?: number
): Promise<JobDescription[]> {
  const db = await getDb();
  if (!db) return [];
  if (departmentId) {
    return db
      .select()
      .from(jobDescriptions)
      .where(
        and(
          eq(jobDescriptions.departmentId, departmentId),
          eq(jobDescriptions.isPublished, true)
        )
      )
      .orderBy(jobDescriptions.order);
  }
  return db
    .select()
    .from(jobDescriptions)
    .where(eq(jobDescriptions.isPublished, true))
    .orderBy(jobDescriptions.order);
}

export async function getAllJobDescriptions(): Promise<JobDescription[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobDescriptions).orderBy(jobDescriptions.order);
}

export async function createJobDescription(
  data: InsertJobDescription
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(jobDescriptions).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateJobDescription(
  id: number,
  data: Partial<InsertJobDescription>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(jobDescriptions).set(data).where(eq(jobDescriptions.id, id));
}

export async function deleteJobDescription(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(jobDescriptions).where(eq(jobDescriptions.id, id));
}
