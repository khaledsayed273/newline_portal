import { and, desc, eq, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  BriefFile,
  Certificate,
  Course,
  CourseLesson,
  Department,
  Enrollment,
  FAQ,
  Incident,
  InsertBriefFile,
  InsertCertificate,
  InsertCourse,
  InsertCourseLesson,
  InsertDepartment,
  InsertEnrollment,
  InsertFAQ,
  InsertIncident,
  InsertJobDescription,
  InsertQuiz,
  InsertQuizAttempt,
  InsertSuggestion,
  InsertTrack,
  InsertTrackCourse,
  InsertTrainingRequest,
  InsertUser,
  JobDescription,
  Quiz,
  QuizAttempt,
  Suggestion,
  Track,
  TrackCourse,
  TrainingRequest,
  User,
  briefFiles,
  certificates,
  courseLessons,
  courseLikes,
  coursePathItems,
  coursePaths,
  courseViews,
  courses,
  departments,
  enrollments,
  faqs,
  incidents,
  jobDescriptions,
  quizAttempts,
  quizzes,
  suggestions,
  trackCourses,
  tracks,
  trainingRequests,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ========== المستخدمون ==========
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach((field) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    });
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin"): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

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

export async function updateDepartment(id: number, data: Partial<InsertDepartment>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(departments).set(data).where(eq(departments.id, id));
}

export async function deleteDepartment(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(departments).where(eq(departments.id, id));
}

// ========== الدورات ==========
export async function getCourses(departmentId?: number): Promise<Course[]> {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(courses);
  if (departmentId) {
    return query.where(and(eq(courses.departmentId, departmentId), eq(courses.isPublished, true))).orderBy(courses.order);
  }
  return query.where(eq(courses.isPublished, true)).orderBy(courses.order);
}

export async function getAllCourses(): Promise<Course[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).orderBy(courses.order);
}

export async function getCourseById(id: number): Promise<Course | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result[0];
}

export async function createCourse(data: InsertCourse): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(courses).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateCourse(id: number, data: Partial<InsertCourse>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(courses).set(data).where(eq(courses.id, id));
}

export async function deleteCourse(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(courses).where(eq(courses.id, id));
}

// ========== دروس الدورة ==========
export async function getCourseLessons(courseId: number): Promise<CourseLesson[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courseLessons)
    .where(and(eq(courseLessons.courseId, courseId), eq(courseLessons.isPublished, true)))
    .orderBy(courseLessons.order);
}

export async function getAllCourseLessons(courseId: number): Promise<CourseLesson[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courseLessons).where(eq(courseLessons.courseId, courseId)).orderBy(courseLessons.order);
}

export async function createLesson(data: InsertCourseLesson): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(courseLessons).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateLesson(id: number, data: Partial<InsertCourseLesson>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(courseLessons).set(data).where(eq(courseLessons.id, id));
}

export async function deleteLesson(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(courseLessons).where(eq(courseLessons.id, id));
}

// ========== التسجيلات ==========
export async function getEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))).limit(1);
  return result[0];
}

export async function getUserEnrollments(userId: number): Promise<Enrollment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.userId, userId));
}

export async function enrollUser(data: InsertEnrollment): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(enrollments).values(data).onDuplicateKeyUpdate({ set: { enrolledAt: new Date() } });
}

export async function updateEnrollmentProgress(userId: number, courseId: number, progress: number, completedLessons: number[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const isCompleted = progress >= 100;
  await db.update(enrollments).set({
    progress,
    completedLessons,
    isCompleted,
    completedAt: isCompleted ? new Date() : undefined,
  }).where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
}

// ========== المسارات ==========
export async function getTracks(departmentId?: number): Promise<Track[]> {
  const db = await getDb();
  if (!db) return [];
  if (departmentId) {
    return db.select().from(tracks)
      .where(and(eq(tracks.departmentId, departmentId), eq(tracks.isPublished, true)))
      .orderBy(tracks.order);
  }
  return db.select().from(tracks).where(eq(tracks.isPublished, true)).orderBy(tracks.order);
}

export async function getAllTracks(): Promise<Track[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tracks).orderBy(tracks.order);
}

export async function getTrackById(id: number): Promise<Track | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tracks).where(eq(tracks.id, id)).limit(1);
  return result[0];
}

export async function createTrack(data: InsertTrack): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(tracks).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateTrack(id: number, data: Partial<InsertTrack>): Promise<void> {
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
  return db.select().from(trackCourses).where(eq(trackCourses.trackId, trackId)).orderBy(trackCourses.order);
}

export async function addCourseToTrack(data: InsertTrackCourse): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(trackCourses).values(data);
}

export async function removeCourseFromTrack(trackId: number, courseId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(trackCourses).where(and(eq(trackCourses.trackId, trackId), eq(trackCourses.courseId, courseId)));
}

// ========== الملفات المختصرة ==========
export async function getBriefFiles(departmentId?: number): Promise<BriefFile[]> {
  const db = await getDb();
  if (!db) return [];
  if (departmentId) {
    return db.select().from(briefFiles)
      .where(and(eq(briefFiles.departmentId, departmentId), eq(briefFiles.isPublished, true)))
      .orderBy(briefFiles.order);
  }
  return db.select().from(briefFiles).where(eq(briefFiles.isPublished, true)).orderBy(briefFiles.order);
}

export async function getAllBriefFiles(): Promise<BriefFile[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(briefFiles).orderBy(briefFiles.order);
}

export async function createBriefFile(data: InsertBriefFile): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(briefFiles).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateBriefFile(id: number, data: Partial<InsertBriefFile>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(briefFiles).set(data).where(eq(briefFiles.id, id));
}

export async function deleteBriefFile(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(briefFiles).where(eq(briefFiles.id, id));
}

// ========== الاختبارات ==========
export async function getQuizzes(departmentId?: number): Promise<Quiz[]> {
  const db = await getDb();
  if (!db) return [];
  if (departmentId) {
    return db.select().from(quizzes)
      .where(and(eq(quizzes.departmentId, departmentId), eq(quizzes.isPublished, true)));
  }
  return db.select().from(quizzes).where(eq(quizzes.isPublished, true));
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
}

export async function getQuizById(id: number): Promise<Quiz | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1);
  return result[0];
}

export async function createQuiz(data: InsertQuiz): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(quizzes).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateQuiz(id: number, data: Partial<InsertQuiz>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(quizzes).set(data).where(eq(quizzes.id, id));
}

export async function deleteQuiz(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(quizzes).where(eq(quizzes.id, id));
}

export async function getUserQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizAttempts)
    .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId)))
    .orderBy(desc(quizAttempts.attemptedAt));
}

export async function submitQuizAttempt(data: InsertQuizAttempt): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(quizAttempts).values(data);
  return { id: Number(result[0].insertId) };
}

// ========== الشهادات ==========
export async function getUserCertificates(userId: number): Promise<Certificate[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificates).where(eq(certificates.userId, userId)).orderBy(desc(certificates.issuedAt));
}

export async function getAllCertificates(): Promise<Certificate[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificates).orderBy(desc(certificates.issuedAt));
}

export async function createCertificate(data: InsertCertificate): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(certificates).values(data);
  return { id: Number(result[0].insertId) };
}

// ========== التعثرات ==========
export async function getUserIncidents(userId: number): Promise<Incident[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(incidents).where(eq(incidents.userId, userId)).orderBy(desc(incidents.createdAt));
}

export async function getAllIncidents(): Promise<Incident[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(incidents).orderBy(desc(incidents.createdAt));
}

export async function createIncident(data: InsertIncident): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(incidents).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateIncident(id: number, data: Partial<InsertIncident>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(incidents).set(data).where(eq(incidents.id, id));
}

// ========== الأسئلة الشائعة ==========
export async function getFAQs(departmentId?: number): Promise<FAQ[]> {
  const db = await getDb();
  if (!db) return [];
  if (departmentId) {
    return db.select().from(faqs)
      .where(and(eq(faqs.departmentId, departmentId), eq(faqs.isPublished, true)))
      .orderBy(faqs.order);
  }
  return db.select().from(faqs).where(eq(faqs.isPublished, true)).orderBy(faqs.order);
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

export async function updateFAQ(id: number, data: Partial<InsertFAQ>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(faqs).set(data).where(eq(faqs.id, id));
}

export async function deleteFAQ(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(faqs).where(eq(faqs.id, id));
}

// ========== طلبات التدريب ==========
export async function getUserTrainingRequests(userId: number): Promise<TrainingRequest[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainingRequests).where(eq(trainingRequests.userId, userId)).orderBy(desc(trainingRequests.createdAt));
}

export async function getAllTrainingRequests(): Promise<TrainingRequest[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainingRequests).orderBy(desc(trainingRequests.createdAt));
}

export async function createTrainingRequest(data: InsertTrainingRequest): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(trainingRequests).values(data);
}

export async function updateTrainingRequest(id: number, data: Partial<InsertTrainingRequest>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(trainingRequests).set(data).where(eq(trainingRequests.id, id));
}

// ========== الاقتراحات ==========
export async function getUserSuggestions(userId: number): Promise<Suggestion[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(suggestions).where(eq(suggestions.userId, userId)).orderBy(desc(suggestions.createdAt));
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

export async function updateSuggestion(id: number, data: Partial<InsertSuggestion>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(suggestions).set(data).where(eq(suggestions.id, id));
}

// ========== الوصف الوظيفي ==========
export async function getJobDescriptions(departmentId?: number): Promise<JobDescription[]> {
  const db = await getDb();
  if (!db) return [];
  if (departmentId) {
    return db.select().from(jobDescriptions)
      .where(and(eq(jobDescriptions.departmentId, departmentId), eq(jobDescriptions.isPublished, true)))
      .orderBy(jobDescriptions.order);
  }
  return db.select().from(jobDescriptions).where(eq(jobDescriptions.isPublished, true)).orderBy(jobDescriptions.order);
}

export async function getAllJobDescriptions(): Promise<JobDescription[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobDescriptions).orderBy(jobDescriptions.order);
}

export async function createJobDescription(data: InsertJobDescription): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(jobDescriptions).values(data);
  return { id: Number(result[0].insertId) };
}

export async function updateJobDescription(id: number, data: Partial<InsertJobDescription>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(jobDescriptions).set(data).where(eq(jobDescriptions.id, id));
}

export async function deleteJobDescription(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(jobDescriptions).where(eq(jobDescriptions.id, id));
}

// ========== الإحصائيات ==========
export async function getStats() {
  const db = await getDb();
  if (!db) return null;
  const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [coursesCount] = await db.select({ count: sql<number>`count(*)` }).from(courses);
  const [tracksCount] = await db.select({ count: sql<number>`count(*)` }).from(tracks);
  const [briefFilesCount] = await db.select({ count: sql<number>`count(*)` }).from(briefFiles);
  const [enrollmentsCount] = await db.select({ count: sql<number>`count(*)` }).from(enrollments);
  const [certificatesCount] = await db.select({ count: sql<number>`count(*)` }).from(certificates);
  const [incidentsCount] = await db.select({ count: sql<number>`count(*)` }).from(incidents);
  const [pendingRequestsCount] = await db.select({ count: sql<number>`count(*)` }).from(trainingRequests).where(eq(trainingRequests.status, "pending"));
  return {
    users: Number(usersCount?.count ?? 0),
    courses: Number(coursesCount?.count ?? 0),
    tracks: Number(tracksCount?.count ?? 0),
    briefFiles: Number(briefFilesCount?.count ?? 0),
    enrollments: Number(enrollmentsCount?.count ?? 0),
    certificates: Number(certificatesCount?.count ?? 0),
    incidents: Number(incidentsCount?.count ?? 0),
    pendingRequests: Number(pendingRequestsCount?.count ?? 0),
  };
}

// ========== الإعجابات على الدورات ==========
export async function toggleCourseLike(courseId: number, userId: number): Promise<{ liked: boolean }> {
  const db = await getDb();
  if (!db) return { liked: false };
  const existing = await db.select().from(courseLikes)
    .where(and(eq(courseLikes.courseId, courseId), eq(courseLikes.userId, userId)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(courseLikes).where(and(eq(courseLikes.courseId, courseId), eq(courseLikes.userId, userId)));
    return { liked: false };
  } else {
    await db.insert(courseLikes).values({ courseId, userId });
    return { liked: true };
  }
}

export async function getCourseLikesCount(courseId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db.select({ count: sql<number>`count(*)` }).from(courseLikes).where(eq(courseLikes.courseId, courseId));
  return Number(result?.count ?? 0);
}

export async function isCourseLiked(courseId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(courseLikes)
    .where(and(eq(courseLikes.courseId, courseId), eq(courseLikes.userId, userId)))
    .limit(1);
  return result.length > 0;
}

// ========== مشاهدات الدورات ==========
export async function recordCourseView(courseId: number, userId?: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(courseViews).values({ courseId, userId });
}

export async function getCourseViewsCount(courseId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const [result] = await db.select({ count: sql<number>`count(*)` }).from(courseViews).where(eq(courseViews.courseId, courseId));
  return Number(result?.count ?? 0);
}

// ========== مسارات الدورات ==========
export async function getCoursePathsByDepartment(departmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coursePaths)
    .where(and(eq(coursePaths.departmentId, departmentId), eq(coursePaths.isPublished, true)))
    .orderBy(coursePaths.order);
}

export async function getCoursePathWithCourses(pathId: number) {
  const db = await getDb();
  if (!db) return null;
  const path = await db.select().from(coursePaths).where(eq(coursePaths.id, pathId)).limit(1);
  if (!path[0]) return null;
  const items = await db.select({
    id: coursePathItems.id,
    order: coursePathItems.order,
    courseId: coursePathItems.courseId,
    courseTitle: courses.title,
    courseDescription: courses.description,
    courseDuration: courses.duration,
    courseLevel: courses.level,
    courseThumbnail: courses.thumbnailUrl,
    courseIsPublished: courses.isPublished,
  })
    .from(coursePathItems)
    .innerJoin(courses, eq(coursePathItems.courseId, courses.id))
    .where(and(eq(coursePathItems.pathId, pathId), eq(courses.isPublished, true)))
    .orderBy(coursePathItems.order);
  return { ...path[0], courses: items };
}

export async function createCoursePath(data: { departmentId: number; name: string; description?: string; order?: number }): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(coursePaths).values({ ...data, isPublished: true });
  return { id: Number(result[0].insertId) };
}

export async function addCourseToPath(pathId: number, courseId: number, order?: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(coursePathItems).values({ pathId, courseId, order: order ?? 0 });
}

export async function removeCourseFromPath(pathId: number, courseId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(coursePathItems).where(and(eq(coursePathItems.pathId, pathId), eq(coursePathItems.courseId, courseId)));
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
  userIdentifier: string;
  pathId: number;
  completedCourses: number;
  totalCourses: number;
  isCompleted: boolean;
  completedAt: Date | null;
  certificateIssued: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getPathProgress(userIdentifier: string, pathId: number): Promise<PathProgress | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(
    sql`SELECT * FROM path_progress WHERE userIdentifier = ${userIdentifier} AND pathId = ${pathId} LIMIT 1`
  );
  const rows = (result[0] as unknown) as PathProgress[];
  return rows[0] ?? null;
}

export async function getAllPathProgressForUser(userIdentifier: string): Promise<PathProgress[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(
    sql`SELECT * FROM path_progress WHERE userIdentifier = ${userIdentifier}`
  );
  return (result[0] as unknown) as PathProgress[];
}

export async function upsertPathProgress(
  userIdentifier: string,
  pathId: number,
  completedCourses: number,
  totalCourses: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const isCompleted = totalCourses > 0 && completedCourses >= totalCourses;
  const completedAt = isCompleted ? new Date() : null;
  await db.execute(
    sql`INSERT INTO path_progress (userIdentifier, pathId, completedCourses, totalCourses, isCompleted, completedAt)
        VALUES (${userIdentifier}, ${pathId}, ${completedCourses}, ${totalCourses}, ${isCompleted ? 1 : 0}, ${completedAt})
        ON DUPLICATE KEY UPDATE
          completedCourses = ${completedCourses},
          totalCourses = ${totalCourses},
          isCompleted = ${isCompleted ? 1 : 0},
          completedAt = CASE WHEN ${isCompleted ? 1 : 0} = 1 AND completedAt IS NULL THEN NOW() ELSE completedAt END,
          updatedAt = NOW()`
  );
}

export async function issueCertificateForPath(userIdentifier: string, pathId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.execute(
    sql`UPDATE path_progress SET certificateIssued = 1 WHERE userIdentifier = ${userIdentifier} AND pathId = ${pathId} AND isCompleted = 1`
  );
}

export async function getPathsWithProgressForDepartment(userIdentifier: string, departmentId: number) {
  const db = await getDb();
  if (!db) return [];
  const paths = await db.select().from(coursePaths)
    .where(and(eq(coursePaths.departmentId, departmentId), eq(coursePaths.isPublished, true)))
    .orderBy(coursePaths.order);

  if (paths.length === 0) return [];

  const progressResult = await db.execute(
    sql`SELECT * FROM path_progress WHERE userIdentifier = ${userIdentifier} AND pathId IN (${sql.join(paths.map(p => sql`${p.id}`), sql`, `)})`
  );
  const progressRows = (progressResult[0] as unknown) as PathProgress[];
  const progressMap = new Map(progressRows.map(p => [p.pathId, p]));

  // احسب عدد الدورات الفعلي لكل مسار من course_path_items
  const pathIds = paths.map(p => p.id);
  const itemCountResult = await db.execute(
    sql`SELECT pathId, COUNT(*) as cnt FROM course_path_items WHERE pathId IN (${sql.join(pathIds.map(id => sql`${id}`), sql`, `)}) GROUP BY pathId`
  );
  const itemCounts = (itemCountResult[0] as unknown) as { pathId: number; cnt: number }[];
  const itemCountMap = new Map(itemCounts.map(r => [Number(r.pathId), Number(r.cnt)]));

  return paths.map((path, index) => {
    const progress = progressMap.get(path.id);
    const prevPath = index > 0 ? paths[index - 1] : null;
    const prevProgress = prevPath ? progressMap.get(prevPath.id) : null;
    const isLocked = index > 0 && (!prevProgress || !prevProgress.isCompleted);
    const actualTotal = itemCountMap.get(path.id) ?? 0;
    const completedCourses = progress?.completedCourses ?? 0;
    const totalCourses = actualTotal > 0 ? actualTotal : (progress?.totalCourses ?? 0);
    return {
      ...path,
      progress: progress ?? null,
      isLocked,
      completedCourses,
      totalCourses,
      isCompleted: progress?.isCompleted ?? false,
      certificateIssued: progress?.certificateIssued ?? false,
      progressPercent: totalCourses > 0
        ? Math.round((completedCourses / totalCourses) * 100)
        : 0,
    };
  });
}

// ========== تتبع مشاهدة الدروس ==========
export async function getLessonWatchProgress(userIdentifier: string, lessonId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(
    sql`SELECT * FROM lesson_watch_progress WHERE userIdentifier = ${userIdentifier} AND lessonId = ${lessonId} LIMIT 1`
  );
  const rows = (result[0] as unknown) as any[];
  return rows[0] ?? null;
}

export async function upsertLessonWatchProgress(
  userIdentifier: string,
  lessonId: number,
  courseId: number,
  watchedSeconds: number,
  totalSeconds: number
) {
  const db = await getDb();
  if (!db) return null;
  const isCompleted = totalSeconds > 0 && watchedSeconds >= totalSeconds * 0.95;
  const completedAt = isCompleted ? new Date() : null;
  await db.execute(
    sql`INSERT INTO lesson_watch_progress (userIdentifier, lessonId, courseId, watchedSeconds, totalSeconds, isCompleted, completedAt)
        VALUES (${userIdentifier}, ${lessonId}, ${courseId}, ${watchedSeconds}, ${totalSeconds}, ${isCompleted}, ${completedAt})
        ON DUPLICATE KEY UPDATE
          watchedSeconds = GREATEST(watchedSeconds, ${watchedSeconds}),
          totalSeconds = CASE WHEN ${totalSeconds} > 0 THEN ${totalSeconds} ELSE totalSeconds END,
          isCompleted = CASE WHEN ${isCompleted} = 1 THEN 1 ELSE isCompleted END,
          completedAt = CASE WHEN ${isCompleted} = 1 AND completedAt IS NULL THEN NOW() ELSE completedAt END,
          updatedAt = NOW()`
  );
  return { isCompleted };
}

export async function getCourseWatchProgress(userIdentifier: string, courseId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(
    sql`SELECT * FROM lesson_watch_progress WHERE userIdentifier = ${userIdentifier} AND courseId = ${courseId}`
  );
  return (result[0] as unknown) as any[];
}

// ========== بيانات المتدرب (الاسم الثلاثي والرقم الوظيفي) ==========
export async function getTraineeProfile(userIdentifier: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(
    sql`SELECT * FROM trainee_profiles WHERE userIdentifier = ${userIdentifier} LIMIT 1`
  );
  const rows = (result[0] as unknown) as any[];
  return rows[0] ?? null;
}

export async function upsertTraineeProfile(userIdentifier: string, fullName: string, employeeId: string) {
  const db = await getDb();
  if (!db) return null;
  await db.execute(
    sql`INSERT INTO trainee_profiles (userIdentifier, fullName, employeeId)
        VALUES (${userIdentifier}, ${fullName}, ${employeeId})
        ON DUPLICATE KEY UPDATE fullName = ${fullName}, employeeId = ${employeeId}, updatedAt = NOW()`
  );
  return { userIdentifier, fullName, employeeId };
}

// ========== تحديث إنجاز المسار تلقائياً عند إكمال دورة ==========
export async function recalcPathProgressForUser(userIdentifier: string, courseId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // إيجاد المسارات التي تحتوي على هذه الدورة
  const pathItemsResult = await db.execute(
    sql`SELECT pathId FROM course_path_items WHERE courseId = ${courseId}`
  );
  const pathItems = (pathItemsResult[0] as unknown) as { pathId: number }[];
  if (pathItems.length === 0) return;

  for (const item of pathItems) {
    const pathId = item.pathId;

    // عدد الدورات الكلي في المسار
    const totalResult = await db.execute(
      sql`SELECT COUNT(*) as cnt FROM course_path_items WHERE pathId = ${pathId}`
    );
    const totalRows = (totalResult[0] as unknown) as { cnt: number }[];
    const totalCourses = Number(totalRows[0]?.cnt ?? 0);
    if (totalCourses === 0) continue;

    // الدورات المكتملة: الدورات التي أكمل المستخدم مشاهدة جميع دروسها
    const completedCoursesResult = await db.execute(
      sql`SELECT cpi.courseId FROM course_path_items cpi
          WHERE cpi.pathId = ${pathId}
          AND (
            SELECT COUNT(*) FROM course_lessons cl
            WHERE cl.courseId = cpi.courseId AND cl.isPublished = 1
          ) > 0
          AND (
            SELECT COUNT(*) FROM course_lessons cl
            WHERE cl.courseId = cpi.courseId AND cl.isPublished = 1
          ) = (
            SELECT COUNT(*) FROM lesson_watch_progress lwp
            WHERE lwp.courseId = cpi.courseId AND lwp.userIdentifier = ${userIdentifier} AND lwp.isCompleted = 1
          )`
    );
    const completedRows = (completedCoursesResult[0] as unknown) as { courseId: number }[];
    const completedCourses = completedRows.length;

    await upsertPathProgress(userIdentifier, pathId, completedCourses, totalCourses);
  }
}

// ========== الخارطة التدريبية ==========
export async function getTrainingMapCourses(departmentId?: number, isRequired?: boolean) {
    const db = await getDb();
  if (!db) return [];
  let query = `SELECT * FROM training_map_courses WHERE 1=1`;
  if (departmentId !== undefined) query += ` AND departmentId = ${departmentId}`;
  if (isRequired !== undefined) query += ` AND isRequired = ${isRequired ? 1 : 0}`;
  query += ` ORDER BY \`order\` ASC`;
  const result = await db.execute(sql.raw(query));
  return (result[0] as unknown) as Array<{
    id: number; title: string; departmentId: number; departmentName: string;
    pathName: string; targetRole: string; level: string; duration: number;
    isRequired: number; contentTypes: string; source: string; sourceUrl: string;
    category: string; order: number;
  }>;
}

export async function getTrainingMapStats() {
  const db = await getDb();
  if (!db) return { total: 0, mandatory: 0, optional: 0, departments: 0, paths: 0, totalMinutes: 0 };
  const result = await db.execute(sql`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN isRequired = 1 THEN 1 ELSE 0 END) as mandatory,
      SUM(CASE WHEN isRequired = 0 THEN 1 ELSE 0 END) as optional,
      COUNT(DISTINCT departmentName) as departments,
      COUNT(DISTINCT pathName) as paths,
      SUM(duration) as totalMinutes
    FROM training_map_courses
  `);
  const rows = (result[0] as unknown) as Array<{
    total: number; mandatory: number; optional: number;
    departments: number; paths: number; totalMinutes: number;
  }>;
  return rows[0] || { total: 0, mandatory: 0, optional: 0, departments: 0, paths: 0, totalMinutes: 0 };
}

// ========== المكتبة التدريبية ==========
export async function getLibraryResources(
  category?: string, source?: string, search?: string,
  page = 1, limit = 20
) {
  const db = await getDb();
  if (!db) return { items: [], total: 0, page, limit, totalPages: 0 };
  const offset = (page - 1) * limit;
  let whereClause = `WHERE 1=1`;
  if (category) whereClause += ` AND category = '${category.replace(/'/g, "''")}'`;
  if (source) whereClause += ` AND source = '${source.replace(/'/g, "''")}'`;
  if (search) {
    const s = search.replace(/'/g, "''");
    whereClause += ` AND (title LIKE '%${s}%' OR description LIKE '%${s}%')`;
  }
  const countResult = await db.execute(sql.raw(`SELECT COUNT(*) as total FROM library_resources ${whereClause}`));
  const countRows = (countResult[0] as unknown) as Array<{ total: number }>;
  const total = Number(countRows[0]?.total) || 0;
  const dataResult = await db.execute(sql.raw(
    `SELECT * FROM library_resources ${whereClause} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`
  ));
  const items = (dataResult[0] as unknown) as Array<{
    id: number; title: string; description: string; url: string;
    source: string; category: string; contentType: string; language: string;
    level: string; duration: number; isFree: number; tags: string; createdAt: number;
  }>;
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getLibraryCategories() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`SELECT DISTINCT category, COUNT(*) as count FROM library_resources GROUP BY category ORDER BY count DESC`);
  return (result[0] as unknown) as Array<{ category: string; count: number }>;
}

export async function getLibrarySources() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`SELECT DISTINCT source, COUNT(*) as count FROM library_resources GROUP BY source ORDER BY count DESC`);
  return (result[0] as unknown) as Array<{ source: string; count: number }>;
}

export async function getLibraryStats() {
  const db = await getDb();
  if (!db) return { total: 0, sources: 0, categories: 0, freeCount: 0 };
  const result = await db.execute(sql`
    SELECT 
      COUNT(*) as total,
      COUNT(DISTINCT source) as sources,
      COUNT(DISTINCT category) as categories,
      SUM(CASE WHEN isFree = 1 THEN 1 ELSE 0 END) as freeCount
    FROM library_resources
  `);
  const rows = (result[0] as unknown) as Array<{
    total: number; sources: number; categories: number; freeCount: number;
  }>;
  return rows[0] || { total: 0, sources: 0, categories: 0, freeCount: 0 };
}

// ========== تقييم الانطباع عن الدورة ==========
export async function submitCourseRating(input: {
  courseId: number; userIdentifier: string;
  q1: number; q2: number; q3: number; q4: number; q5: number;
  comment?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // حذف التقييم القديم إن وجد
  await db.execute(sql`DELETE FROM course_ratings WHERE courseId = ${input.courseId} AND userIdentifier = ${input.userIdentifier}`);
  await db.execute(sql`
    INSERT INTO course_ratings (courseId, userIdentifier, q1, q2, q3, q4, q5, comment)
    VALUES (${input.courseId}, ${input.userIdentifier}, ${input.q1}, ${input.q2}, ${input.q3}, ${input.q4}, ${input.q5}, ${input.comment ?? null})
  `);
  return { success: true };
}

export async function getCourseRating(courseId: number, userIdentifier: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`SELECT * FROM course_ratings WHERE courseId = ${courseId} AND userIdentifier = ${userIdentifier} LIMIT 1`);
  const rows = (result[0] as unknown) as any[];
  return rows[0] ?? null;
}

// ========== اختبار الدورة ==========
export async function getCourseExam(courseId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`SELECT * FROM course_exams WHERE courseId = ${courseId} LIMIT 1`);
  const rows = (result[0] as unknown) as any[];
  if (!rows[0]) return null;
  const row = rows[0];
  return {
    ...row,
    questions: typeof row.questions === 'string' ? JSON.parse(row.questions) : row.questions,
  };
}

export async function submitCourseExam(input: {
  courseId: number; userIdentifier: string; answers: number[];
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // جلب الاختبار
  const examResult = await db.execute(sql`SELECT * FROM course_exams WHERE courseId = ${input.courseId} LIMIT 1`);
  const examRows = (examResult[0] as unknown) as any[];
  if (!examRows[0]) throw new Error("لا يوجد اختبار لهذه الدورة");
  const exam = examRows[0];
  const questions = typeof exam.questions === 'string' ? JSON.parse(exam.questions) : exam.questions;
  // حساب الدرجة
  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    if (input.answers[i] === questions[i].correctAnswer) correct++;
  }
  const score = correct * 10; // كل سؤال 10 درجات
  const isPassed = score >= (exam.passingScore ?? 70);
  // حذف المحاولة القديمة وإضافة الجديدة
  await db.execute(sql`DELETE FROM course_exam_attempts WHERE courseId = ${input.courseId} AND userIdentifier = ${input.userIdentifier}`);
  await db.execute(sql`
    INSERT INTO course_exam_attempts (courseId, userIdentifier, answers, score, isPassed)
    VALUES (${input.courseId}, ${input.userIdentifier}, ${JSON.stringify(input.answers)}, ${score}, ${isPassed})
  `);
  return { score, isPassed, correct, total: questions.length };
}

export async function getCourseExamAttempt(courseId: number, userIdentifier: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`SELECT * FROM course_exam_attempts WHERE courseId = ${courseId} AND userIdentifier = ${userIdentifier} ORDER BY attemptedAt DESC LIMIT 1`);
  const rows = (result[0] as unknown) as any[];
  if (!rows[0]) return null;
  const row = rows[0];
  return {
    ...row,
    answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers,
  };
}

export async function upsertCourseExam(input: {
  courseId: number;
  questions: Array<{ id: number; question: string; options: string[]; correctAnswer: number }>;
  passingScore: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.execute(sql`
    INSERT INTO course_exams (courseId, questions, passingScore)
    VALUES (${input.courseId}, ${JSON.stringify(input.questions)}, ${input.passingScore})
    ON DUPLICATE KEY UPDATE questions = ${JSON.stringify(input.questions)}, passingScore = ${input.passingScore}
  `);
  return { success: true };
}

// ========== شهادة إتمام الدورة ==========
export async function getCourseCompletionCert(courseId: number, userIdentifier: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`SELECT * FROM course_completion_certs WHERE courseId = ${courseId} AND userIdentifier = ${userIdentifier} LIMIT 1`);
  const rows = (result[0] as unknown) as any[];
  return rows[0] ?? null;
}

export async function getCourseCompletionCertByCode(certCode: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.execute(sql`SELECT * FROM course_completion_certs WHERE certCode = ${certCode} LIMIT 1`);
  const rows = (result[0] as unknown) as any[];
  return rows[0] ?? null;
}

export async function issueCourseCompletionCert(input: {
  courseId: number; userIdentifier: string; fullName: string;
  employeeId: string; courseName: string; departmentName?: string; score: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // تحقق من عدم وجود شهادة سابقة
  const existing = await getCourseCompletionCert(input.courseId, input.userIdentifier);
  if (existing) return existing;
  // توليد رمز الشهادة
  const certCode = `NL-${input.courseId}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  await db.execute(sql`
    INSERT INTO course_completion_certs (courseId, userIdentifier, fullName, employeeId, courseName, departmentName, score, certCode)
    VALUES (${input.courseId}, ${input.userIdentifier}, ${input.fullName}, ${input.employeeId}, ${input.courseName}, ${input.departmentName ?? null}, ${input.score}, ${certCode})
  `);
  return { certCode, issuedAt: new Date() };
}

// ========== إحصائيات المتدرب الشخصية ==========
export async function getTraineeCerts(userIdentifier: string) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.execute(sql`
    SELECT id, courseId, courseName, certCode, issuedAt
    FROM course_completion_certs
    WHERE userIdentifier = ${userIdentifier}
    ORDER BY issuedAt DESC
  `);
  return (rows as any[])[0] as any[];
}

export async function getTraineeConsultationsCount(userIdentifier: string): Promise<number> {
  // عدد طلبات التدريب المقدمة من المتدرب (تُعدّ استشارات)
  // نبحث في trainee_profiles عن userId المرتبط بـ userIdentifier
  const db = await getDb();
  if (!db) return 0;
  try {
    // أولاً: جلب userId من trainee_profiles
    const profileRows = await db.execute(sql`
      SELECT userId FROM trainee_profiles WHERE userIdentifier = ${userIdentifier} LIMIT 1
    `);
    const profileData = (profileRows as any[])[0] as any[];
    const userId = profileData?.[0]?.userId;
    if (!userId) return 0;
    const rows = await db.execute(sql`
      SELECT COUNT(*) as cnt
      FROM training_requests
      WHERE userId = ${userId}
    `);
    const data = (rows as any[])[0] as any[];
    return Number(data?.[0]?.cnt ?? 0);
  } catch {
    return 0;
  }
}
