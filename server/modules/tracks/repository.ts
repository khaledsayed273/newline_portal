import { and, eq } from "drizzle-orm";
import {
  getDb,
  InsertTrack,
  InsertTrackCourse,
  trackCourses,
  tracks,
  Track,
  TrackCourse,
} from "../../infrastructure/database";

// ========== المسارات ==========
export async function getTracks(departmentId?: number): Promise<Track[]> {
  const db = await getDb();
  if (!db) return [];
  if (departmentId) {
    return db
      .select()
      .from(tracks)
      .where(
        and(eq(tracks.departmentId, departmentId), eq(tracks.isPublished, true))
      )
      .orderBy(tracks.order);
  }
  return db
    .select()
    .from(tracks)
    .where(eq(tracks.isPublished, true))
    .orderBy(tracks.order);
}

export async function getAllTracks(): Promise<Track[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tracks).orderBy(tracks.order);
}

export async function getTrackById(id: number): Promise<Track | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(tracks)
    .where(eq(tracks.id, id))
    .limit(1);
  return result[0];
}

export async function createTrack(data: InsertTrack): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(tracks).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateTrack(
  id: number,
  data: Partial<InsertTrack>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(tracks).set(data).where(eq(tracks.id, id));
}

export async function deleteTrack(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(tracks).where(eq(tracks.id, id));
}

export async function getTrackCourses(trackId: number): Promise<TrackCourse[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(trackCourses)
    .where(eq(trackCourses.trackId, trackId))
    .orderBy(trackCourses.order);
}

export async function addCourseToTrack(data: InsertTrackCourse): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(trackCourses).values(data);
}

export async function removeCourseFromTrack(
  trackId: number,
  courseId: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(trackCourses)
    .where(
      and(
        eq(trackCourses.trackId, trackId),
        eq(trackCourses.courseId, courseId)
      )
    );
}
