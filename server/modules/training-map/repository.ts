import { and, eq } from "drizzle-orm";
import {
  getDb,
  trainingMapCourses,
} from "../../infrastructure/database";

// ========== الخارطة التدريبية ==========
export async function getTrainingMapCourses(
  departmentId?: number,
  isRequired?: boolean
) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (departmentId !== undefined)
    conditions.push(eq(trainingMapCourses.departmentId, departmentId));
  if (isRequired !== undefined)
    conditions.push(eq(trainingMapCourses.isRequired, isRequired));
  const rows = await db
    .select()
    .from(trainingMapCourses)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(trainingMapCourses.order);
  return rows.map(row => ({
    ...row,
    departmentId: row.departmentId ?? 0,
    departmentName: row.departmentName ?? "",
    pathName: row.pathName ?? "",
    targetRole: row.targetRole ?? "",
    level: row.level ?? "beginner",
    duration: row.duration ?? 0,
    contentTypes: JSON.stringify(row.contentTypes ?? []),
    source: row.source ?? "",
    sourceUrl: row.sourceUrl ?? "",
    category: row.category ?? "",
  }));
}

export async function getTrainingMapStats(departmentId?: number) {
  const db = await getDb();
  if (!db)
    return {
      total: 0,
      mandatory: 0,
      optional: 0,
      departments: 0,
      paths: 0,
      totalMinutes: 0,
    };
  const conditions =
    departmentId === undefined
      ? undefined
      : eq(trainingMapCourses.departmentId, departmentId);
  const rows = await db.select().from(trainingMapCourses).where(conditions);
  return {
    total: rows.length,
    mandatory: rows.filter(row => row.isRequired).length,
    optional: rows.filter(row => !row.isRequired).length,
    departments: new Set(
      rows.map(row => row.departmentName).filter(Boolean)
    ).size,
    paths: new Set(rows.map(row => row.pathName).filter(Boolean)).size,
    totalMinutes: rows.reduce((total, row) => total + (row.duration ?? 0), 0),
  };
}
