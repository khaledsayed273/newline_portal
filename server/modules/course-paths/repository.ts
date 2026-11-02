import { and, count, eq, inArray } from "drizzle-orm";
import {
  courseLessons,
  courseLikes,
  coursePathItems,
  coursePaths,
  courseViews,
  courses,
  enrollments,
  getDb,
  lessonWatchProgress,
  pathProgress,
} from "../../infrastructure/database";

// ========== مسارات الدورات ==========
export async function getCoursePathsByDepartment(departmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(coursePaths)
    .where(
      and(
        eq(coursePaths.departmentId, departmentId),
        eq(coursePaths.isPublished, true)
      )
    )
    .orderBy(coursePaths.order);
}

export async function getAllCoursePaths() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coursePaths).orderBy(coursePaths.order);
}

export async function getCoursePathWithCourses(
  pathId: number,
  userId?: number
) {
  const db = await getDb();
  if (!db) return null;
  const path = await db
    .select()
    .from(coursePaths)
    .where(eq(coursePaths.id, pathId))
    .limit(1);
  if (!path[0]) return null;
  const baseItems = await db
    .select({
      id: coursePathItems.id,
      order: coursePathItems.order,
      courseId: coursePathItems.courseId,
      courseTitle: courses.title,
      courseDescription: courses.description,
      courseDuration: courses.duration,
      courseLevel: courses.level,
      courseThumbnail: courses.thumbnailUrl,
      courseIsPublished: courses.isPublished,
      courseDepartmentId: courses.departmentId,
    })
    .from(coursePathItems)
    .innerJoin(courses, eq(coursePathItems.courseId, courses.id))
    .where(
      and(eq(coursePathItems.pathId, pathId), eq(courses.isPublished, true))
    )
    .orderBy(coursePathItems.order);
  const items = await Promise.all(
    baseItems.map(async item => {
      const [likes] = await db
        .select({ count: count() })
        .from(courseLikes)
        .where(eq(courseLikes.courseId, item.courseId));
      const views = await db
        .select({ userId: courseViews.userId })
        .from(courseViews)
        .where(eq(courseViews.courseId, item.courseId));
      let likedByMe = false;
      if (userId) {
        const [like] = await db
          .select({ id: courseLikes.id })
          .from(courseLikes)
          .where(
            and(
              eq(courseLikes.courseId, item.courseId),
              eq(courseLikes.userId, userId)
            )
          )
          .limit(1);
        likedByMe = Boolean(like);
      }
      return {
        ...item,
        likesCount: Number(likes?.count ?? 0),
        viewsCount: new Set(views.map(view => view.userId).filter(Boolean)).size,
        likedByMe,
      };
    })
  );
  return { ...path[0], courses: items };
}

export async function createCoursePath(data: {
  departmentId: number;
  name: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db
    .insert(coursePaths)
    .values({ ...data, isPublished: data.isPublished ?? true });
  return { id: Number(result[0].insertId) };
}

export async function updateCoursePath(
  id: number,
  data: {
    departmentId?: number;
    name?: string;
    description?: string;
    order?: number;
    isPublished?: boolean;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(coursePaths).set(data).where(eq(coursePaths.id, id));
}

export async function addCourseToPath(
  pathId: number,
  courseId: number,
  order?: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const path = await db
    .select({ departmentId: coursePaths.departmentId })
    .from(coursePaths)
    .where(eq(coursePaths.id, pathId))
    .limit(1);
  const course = await db
    .select({ departmentId: courses.departmentId })
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);
  if (!path[0] || !course[0]) {
    throw new Error("المسار أو الدورة غير موجود");
  }
  if (path[0].departmentId !== course[0].departmentId) {
    throw new Error("لا يمكن إضافة دورة من إدارة مختلفة إلى هذا المسار");
  }
  await db
    .insert(coursePathItems)
    .values({ pathId, courseId, order: order ?? 0 });
}

export async function removeCourseFromPath(
  pathId: number,
  courseId: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(coursePathItems)
    .where(
      and(
        eq(coursePathItems.pathId, pathId),
        eq(coursePathItems.courseId, courseId)
      )
    );
}

export async function deleteCoursePath(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(coursePathItems).where(eq(coursePathItems.pathId, id));
  await db.delete(coursePaths).where(eq(coursePaths.id, id));
}

// ========== إنجاز مسارات الدورات (path_progress) ==========
export interface PathProgress {
  id: number;
  userId: number;
  pathId: number;
  completedCourses: number;
  totalCourses: number;
  isCompleted: boolean;
  completedAt: Date | null;
  certificateIssued: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getPathProgress(
  userId: number,
  pathId: number
): Promise<PathProgress | null> {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(pathProgress)
    .where(and(eq(pathProgress.userId, userId), eq(pathProgress.pathId, pathId)))
    .limit(1);
  return row ?? null;
}

export async function getAllPathProgressForUser(
  userId: number
): Promise<PathProgress[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(pathProgress)
    .where(eq(pathProgress.userId, userId));
}

export async function upsertPathProgress(
  userId: number,
  pathId: number,
  completedCourses: number,
  totalCourses: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const isCompleted = totalCourses > 0 && completedCourses >= totalCourses;
  const [existing] = await db
    .select({ id: pathProgress.id, completedAt: pathProgress.completedAt })
    .from(pathProgress)
    .where(and(eq(pathProgress.userId, userId), eq(pathProgress.pathId, pathId)))
    .limit(1);
  const completedAt = isCompleted
    ? (existing?.completedAt ?? new Date())
    : (existing?.completedAt ?? null);
  if (existing) {
    await db
      .update(pathProgress)
      .set({ completedCourses, totalCourses, isCompleted, completedAt })
      .where(eq(pathProgress.id, existing.id));
  } else {
    await db.insert(pathProgress).values({
      userId,
      pathId,
      completedCourses,
      totalCourses,
      isCompleted,
      completedAt,
    });
  }
}

export async function issueCertificateForPath(
  userId: number,
  pathId: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(pathProgress)
    .set({ certificateIssued: true })
    .where(
      and(
        eq(pathProgress.userId, userId),
        eq(pathProgress.pathId, pathId),
        eq(pathProgress.isCompleted, true)
      )
    );
}

export async function getPathsWithProgressForDepartment(
  userId: number,
  departmentId: number
) {
  const db = await getDb();
  if (!db) return [];
  const paths = await db
    .select()
    .from(coursePaths)
    .where(
      and(
        eq(coursePaths.departmentId, departmentId),
        eq(coursePaths.isPublished, true)
      )
    )
    .orderBy(coursePaths.order);

  if (paths.length === 0) return [];

  const pathIds = paths.map(p => p.id);
  const progressRows = await db
    .select()
    .from(pathProgress)
    .where(and(eq(pathProgress.userId, userId), inArray(pathProgress.pathId, pathIds)));
  const progressMap = new Map(progressRows.map(p => [p.pathId, p]));

  // احسب عدد الدورات الفعلي لكل مسار من course_path_items
  const itemCounts = await db
    .select({ pathId: coursePathItems.pathId, count: count() })
    .from(coursePathItems)
    .where(inArray(coursePathItems.pathId, pathIds))
    .groupBy(coursePathItems.pathId);
  const itemCountMap = new Map(
    itemCounts.map(r => [Number(r.pathId), Number(r.count)])
  );

  return paths.map((path, index) => {
    const progress = progressMap.get(path.id);
    const prevPath = index > 0 ? paths[index - 1] : null;
    const prevProgress = prevPath ? progressMap.get(prevPath.id) : null;
    const isLocked = index > 0 && (!prevProgress || !prevProgress.isCompleted);
    const actualTotal = itemCountMap.get(path.id) ?? 0;
    const completedCourses = progress?.completedCourses ?? 0;
    const totalCourses =
      actualTotal > 0 ? actualTotal : (progress?.totalCourses ?? 0);
    return {
      ...path,
      progress: progress ?? null,
      isLocked,
      completedCourses,
      totalCourses,
      isCompleted: progress?.isCompleted ?? false,
      certificateIssued: progress?.certificateIssued ?? false,
      progressPercent:
        totalCourses > 0
          ? Math.round((completedCourses / totalCourses) * 100)
          : 0,
    };
  });
}

// ========== تحديث إنجاز المسار تلقائياً عند إكمال دورة ==========
export async function recalcPathProgressForUser(
  userId: number,
  courseId: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // إيجاد المسارات التي تحتوي على هذه الدورة
  const pathItems = await db
    .select({ pathId: coursePathItems.pathId })
    .from(coursePathItems)
    .where(eq(coursePathItems.courseId, courseId));
  if (pathItems.length === 0) return;

  for (const item of pathItems) {
    const pathId = item.pathId;

    // عدد الدورات الكلي في المسار
    const pathCourses = await db
      .select({ courseId: coursePathItems.courseId })
      .from(coursePathItems)
      .where(eq(coursePathItems.pathId, pathId));
    const totalCourses = pathCourses.length;
    if (totalCourses === 0) continue;

    // الدورات المكتملة: الدورات التي أكمل المستخدم مشاهدة جميع دروسها
    let completedCourses = 0;
    for (const { courseId: pathCourseId } of pathCourses) {
      const [lessonCount] = await db
        .select({ count: count() })
        .from(courseLessons)
        .where(
          and(
            eq(courseLessons.courseId, pathCourseId),
            eq(courseLessons.isPublished, true)
          )
        );
      const totalLessons = Number(lessonCount?.count ?? 0);
      if (totalLessons === 0) {
        const [enrollment] = await db
          .select({ id: enrollments.id })
          .from(enrollments)
          .where(
            and(
              eq(enrollments.courseId, pathCourseId),
              eq(enrollments.userId, userId),
              eq(enrollments.isCompleted, true)
            )
          )
          .limit(1);
        if (enrollment) completedCourses++;
      } else {
        const [watchedCount] = await db
          .select({ count: count() })
          .from(lessonWatchProgress)
          .where(
            and(
              eq(lessonWatchProgress.courseId, pathCourseId),
              eq(lessonWatchProgress.userId, userId),
              eq(lessonWatchProgress.isCompleted, true)
            )
          );
        if (Number(watchedCount?.count ?? 0) === totalLessons) {
          completedCourses++;
        }
      }
    }

    await upsertPathProgress(userId, pathId, completedCourses, totalCourses);
  }
}
