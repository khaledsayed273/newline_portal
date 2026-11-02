import { eq } from "drizzle-orm";
import {
  Department,
  getDb,
  InsertDepartment,
  departments,
} from "../../infrastructure/database";

// ========== الإدارات ==========
export async function getDepartments(): Promise<Department[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(departments).orderBy(departments.order);
}

export async function createDepartment(data: InsertDepartment): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(departments).values(data);
}

export async function updateDepartment(
  id: number,
  data: Partial<InsertDepartment>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(departments).set(data).where(eq(departments.id, id));
}

export async function deleteDepartment(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(departments).where(eq(departments.id, id));
}
