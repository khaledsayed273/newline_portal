import { and, count, desc, eq, like } from "drizzle-orm";
import { getDb, libraryResources } from "../../infrastructure/database";

// ========== المكتبة التدريبية ==========
export async function getLibraryResources(
  category?: string,
  source?: string,
  search?: string,
  page = 1,
  limit = 20
) {
  const db = await getDb();
  if (!db) return { items: [], total: 0, page, limit, totalPages: 0 };
  const offset = (page - 1) * limit;
  const conditions = [];
  if (category) conditions.push(eq(libraryResources.category, category));
  if (source) conditions.push(eq(libraryResources.source, source));
  if (search) conditions.push(like(libraryResources.title, `%${search}%`));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [countRow] = await db
    .select({ total: count() })
    .from(libraryResources)
    .where(where);
  const total = Number(countRow?.total ?? 0);
  const rows = await db
    .select()
    .from(libraryResources)
    .where(where)
    .orderBy(desc(libraryResources.id))
    .limit(limit)
    .offset(offset);
  const items = rows.map(row => ({
    ...row,
    // Keep the response compatible with the legacy API shape.
    description: undefined,
    tags: JSON.stringify(row.tags ?? []),
    level: row.level ?? "beginner",
    duration: row.duration ?? 0,
  }));
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLibraryCategories() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ category: libraryResources.category, count: count() })
    .from(libraryResources)
    .groupBy(libraryResources.category)
    .orderBy(desc(count()));
}

export async function getLibrarySources() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ source: libraryResources.source, count: count() })
    .from(libraryResources)
    .groupBy(libraryResources.source)
    .orderBy(desc(count()));
}

export async function getLibraryStats() {
  const db = await getDb();
  if (!db) return { total: 0, sources: 0, categories: 0, freeCount: 0 };
  const rows = await db.select().from(libraryResources);
  return {
    total: rows.length,
    sources: new Set(rows.map(row => row.source)).size,
    categories: new Set(rows.map(row => row.category)).size,
    freeCount: rows.filter(row => row.isFree).length,
  };
}
