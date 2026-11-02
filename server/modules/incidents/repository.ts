import { desc, eq } from "drizzle-orm";
import {
  getDb,
  incidents,
  Incident,
  InsertIncident,
  users,
} from "../../infrastructure/database";

// ========== التعثرات ==========
export async function getUserIncidents(userId: number): Promise<Incident[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(incidents)
    .where(eq(incidents.userId, userId))
    .orderBy(desc(incidents.createdAt));
}

export async function getAllIncidents(): Promise<Incident[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: incidents.id,
      userId: incidents.userId,
      title: incidents.title,
      description: incidents.description,
      category: incidents.category,
      status: incidents.status,
      priority: incidents.priority,
      adminNotes: incidents.adminNotes,
      resolvedAt: incidents.resolvedAt,
      createdAt: incidents.createdAt,
      updatedAt: incidents.updatedAt,
      user: {
        id: users.id,
        name: users.name,
        employeeNumber: users.employeeNumber,
      },
    })
    .from(incidents)
    .leftJoin(users, eq(users.id, incidents.userId))
    .orderBy(desc(incidents.createdAt));
  return rows as unknown as Incident[];
}

export async function createIncident(
  data: InsertIncident
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(incidents).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateIncident(
  id: number,
  data: Partial<InsertIncident>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(incidents).set(data).where(eq(incidents.id, id));
}
