import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ========== جدول المستخدمين ==========
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  department: varchar("department", { length: 128 }),
  jobTitle: varchar("jobTitle", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ========== جدول الإدارات/الأقسام ==========
export const departments = mysqlTable("departments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  nameEn: varchar("nameEn", { length: 128 }),
  description: text("description"),
  color: varchar("color", { length: 32 }),
  icon: varchar("icon", { length: 64 }),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

// ========== جدول الدورات التدريبية ==========
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  departmentId: int("departmentId"),
  thumbnailUrl: text("thumbnailUrl"),
  duration: int("duration"), // بالدقائق
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default("beginner"),
  isPublished: boolean("isPublished").default(false).notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// ========== جدول دروس الدورة (فيديوهات) ==========
export const courseLessons = mysqlTable("course_lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  videoUrl: text("videoUrl"),
  videoType: mysqlEnum("videoType", ["youtube", "vimeo", "direct", "embed"]).default("youtube"),
  duration: int("duration"), // بالثواني
  order: int("order").default(0),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CourseLesson = typeof courseLessons.$inferSelect;
export type InsertCourseLesson = typeof courseLessons.$inferInsert;

// ========== جدول تسجيلات المتدربين في الدورات ==========
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId").notNull(),
  progress: int("progress").default(0), // نسبة مئوية 0-100
  completedLessons: json("completedLessons").$type<number[]>(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

// ========== جدول المسارات التدريبية ==========
export const tracks = mysqlTable("tracks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  departmentId: int("departmentId"),
  thumbnailUrl: text("thumbnailUrl"),
  targetRole: varchar("targetRole", { length: 128 }),
  isPublished: boolean("isPublished").default(false).notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;

// ========== جدول ربط المسارات بالدورات ==========
export const trackCourses = mysqlTable("track_courses", {
  id: int("id").autoincrement().primaryKey(),
  trackId: int("trackId").notNull(),
  courseId: int("courseId").notNull(),
  order: int("order").default(0),
  isRequired: boolean("isRequired").default(true).notNull(),
});

export type TrackCourse = typeof trackCourses.$inferSelect;
export type InsertTrackCourse = typeof trackCourses.$inferInsert;

// ========== جدول الملفات المختصرة ==========
export const briefFiles = mysqlTable("brief_files", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  departmentId: int("departmentId"),
  fileUrl: text("fileUrl"),
  fileType: varchar("fileType", { length: 32 }),
  fileSize: int("fileSize"),
  thumbnailUrl: text("thumbnailUrl"),
  isPublished: boolean("isPublished").default(false).notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BriefFile = typeof briefFiles.$inferSelect;
export type InsertBriefFile = typeof briefFiles.$inferInsert;

// ========== جدول الاختبارات ==========
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  courseId: int("courseId"),
  departmentId: int("departmentId"),
  questions: json("questions").$type<QuizQuestion[]>(),
  passingScore: int("passingScore").default(60),
  timeLimit: int("timeLimit"), // بالدقائق
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

// ========== جدول نتائج الاختبارات ==========
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  quizId: int("quizId").notNull(),
  answers: json("answers").$type<number[]>(),
  score: int("score").default(0),
  isPassed: boolean("isPassed").default(false).notNull(),
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

// ========== جدول الشهادات ==========
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  courseId: int("courseId"),
  trackId: int("trackId"),
  title: varchar("title", { length: 256 }).notNull(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  certificateCode: varchar("certificateCode", { length: 64 }).unique(),
  fileUrl: text("fileUrl"),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

// ========== جدول التعثرات ==========
export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 128 }),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  adminNotes: text("adminNotes"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

// ========== جدول الأسئلة الشائعة ==========
export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 128 }),
  departmentId: int("departmentId"),
  order: int("order").default(0),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = typeof faqs.$inferInsert;

// ========== جدول طلبات التدريب ==========
export const trainingRequests = mysqlTable("training_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  requestedDate: timestamp("requestedDate"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "completed"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrainingRequest = typeof trainingRequests.$inferSelect;
export type InsertTrainingRequest = typeof trainingRequests.$inferInsert;

// ========== جدول الاقتراحات والأفكار ==========
export const suggestions = mysqlTable("suggestions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 128 }),
  status: mysqlEnum("status", ["new", "reviewed", "implemented", "rejected"]).default("new").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Suggestion = typeof suggestions.$inferSelect;
export type InsertSuggestion = typeof suggestions.$inferInsert;

// ========== جدول الوصف الوظيفي ==========
export const jobDescriptions = mysqlTable("job_descriptions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  departmentId: int("departmentId"),
  responsibilities: json("responsibilities").$type<string[]>(),
  requirements: json("requirements").$type<string[]>(),
  fileUrl: text("fileUrl"),
  isPublished: boolean("isPublished").default(true).notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobDescription = typeof jobDescriptions.$inferSelect;
export type InsertJobDescription = typeof jobDescriptions.$inferInsert;

// ========== جدول الإعجابات على الدورات ==========
export const courseLikes = mysqlTable("course_likes", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CourseLike = typeof courseLikes.$inferSelect;
export type InsertCourseLike = typeof courseLikes.$inferInsert;

// ========== جدول مشاهدات الدورات ==========
export const courseViews = mysqlTable("course_views", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  userId: int("userId"),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});

export type CourseView = typeof courseViews.$inferSelect;
export type InsertCourseView = typeof courseViews.$inferInsert;

// ========== جدول مسارات الدورات (مسار أول / مسار ثاني) ==========
export const coursePaths = mysqlTable("course_paths", {
  id: int("id").autoincrement().primaryKey(),
  departmentId: int("departmentId").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  order: int("order").default(0),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoursePath = typeof coursePaths.$inferSelect;
export type InsertCoursePath = typeof coursePaths.$inferInsert;

// ========== جدول ربط الدورات بالمسارات ==========
export const coursePathItems = mysqlTable("course_path_items", {
  id: int("id").autoincrement().primaryKey(),
  pathId: int("pathId").notNull(),
  courseId: int("courseId").notNull(),
  order: int("order").default(0),
});

export type CoursePathItem = typeof coursePathItems.$inferSelect;
export type InsertCoursePathItem = typeof coursePathItems.$inferInsert;

// ========== جدول تتبع مشاهدة الدروس (مؤشر الإكمال الصارم) ==========
export const lessonWatchProgress = mysqlTable("lesson_watch_progress", {
  id: int("id").autoincrement().primaryKey(),
  userIdentifier: varchar("userIdentifier", { length: 128 }).notNull(),
  lessonId: int("lessonId").notNull(),
  courseId: int("courseId").notNull(),
  watchedSeconds: int("watchedSeconds").default(0).notNull(),
  totalSeconds: int("totalSeconds").default(0).notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LessonWatchProgress = typeof lessonWatchProgress.$inferSelect;
export type InsertLessonWatchProgress = typeof lessonWatchProgress.$inferInsert;

// ========== جدول بيانات المتدرب (الاسم الثلاثي والرقم الوظيفي) ==========
export const traineeProfiles = mysqlTable("trainee_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userIdentifier: varchar("userIdentifier", { length: 128 }).notNull().unique(),
  fullName: varchar("fullName", { length: 128 }).notNull(),
  employeeId: varchar("employeeId", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TraineeProfile = typeof traineeProfiles.$inferSelect;
export type InsertTraineeProfile = typeof traineeProfiles.$inferInsert;

// ========== جدول المكتبة التدريبية الخارجية ==========
export const libraryResources = mysqlTable("library_resources", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  url: text("url").notNull(),
  source: varchar("source", { length: 128 }).notNull(),
  sourceName: varchar("sourceName", { length: 256 }),
  category: varchar("category", { length: 128 }).notNull(),
  subcategory: varchar("subcategory", { length: 128 }),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default("beginner"),
  duration: int("duration"), // بالدقائق
  contentType: mysqlEnum("contentType", ["video", "article", "pdf", "course", "quiz", "tool"]).default("video"),
  isFree: boolean("isFree").default(true).notNull(),
  language: varchar("language", { length: 8 }).default("ar"),
  tags: json("tags").$type<string[]>(),
  isPublished: boolean("isPublished").default(true).notNull(),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LibraryResource = typeof libraryResources.$inferSelect;
export type InsertLibraryResource = typeof libraryResources.$inferInsert;

// ========== جدول الخارطة التدريبية ==========
export const trainingMapCourses = mysqlTable("training_map_courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  departmentId: int("departmentId"),
  departmentName: varchar("departmentName", { length: 128 }),
  pathName: varchar("pathName", { length: 128 }),
  targetRole: varchar("targetRole", { length: 256 }),
  level: mysqlEnum("level", ["beginner", "intermediate", "advanced"]).default("beginner"),
  duration: int("duration"), // بالدقائق
  isRequired: boolean("isRequired").default(true).notNull(),
  contentTypes: json("contentTypes").$type<string[]>(), // ["video","pdf","quiz","case"]
  source: varchar("source", { length: 256 }),
  sourceUrl: text("sourceUrl"),
  category: varchar("category", { length: 128 }),
  order: int("order").default(0),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainingMapCourse = typeof trainingMapCourses.$inferSelect;
export type InsertTrainingMapCourse = typeof trainingMapCourses.$inferInsert;

// ========== جدول تقييم انطباع الدورة (5 أسئلة) ==========
export const courseRatings = mysqlTable("course_ratings", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  userIdentifier: varchar("userIdentifier", { length: 128 }).notNull(),
  q1: int("q1").notNull(), // جودة المحتوى (1-5)
  q2: int("q2").notNull(), // وضوح الشرح (1-5)
  q3: int("q3").notNull(), // الاستفادة العملية (1-5)
  q4: int("q4").notNull(), // توصية للزملاء (1-5)
  q5: int("q5").notNull(), // التقييم العام (1-5)
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CourseRating = typeof courseRatings.$inferSelect;
export type InsertCourseRating = typeof courseRatings.$inferInsert;

// ========== جدول اختبار الدورة (10 أسئلة متعددة) ==========
export const courseExams = mysqlTable("course_exams", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull().unique(),
  questions: json("questions").$type<CourseExamQuestion[]>().notNull(),
  passingScore: int("passingScore").default(70).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CourseExamQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index 0-3
};
export type CourseExam = typeof courseExams.$inferSelect;

// ========== جدول نتائج اختبار الدورة ==========
export const courseExamAttempts = mysqlTable("course_exam_attempts", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  userIdentifier: varchar("userIdentifier", { length: 128 }).notNull(),
  answers: json("answers").$type<number[]>().notNull(),
  score: int("score").default(0).notNull(), // 0-100
  isPassed: boolean("isPassed").default(false).notNull(),
  attemptedAt: timestamp("attemptedAt").defaultNow().notNull(),
});
export type CourseExamAttempt = typeof courseExamAttempts.$inferSelect;

// ========== جدول شهادات الدورات ==========
export const courseCompletionCerts = mysqlTable("course_completion_certs", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  userIdentifier: varchar("userIdentifier", { length: 128 }).notNull(),
  fullName: varchar("fullName", { length: 256 }).notNull(),
  employeeId: varchar("employeeId", { length: 64 }).notNull(),
  courseName: varchar("courseName", { length: 512 }).notNull(),
  departmentName: varchar("departmentName", { length: 128 }),
  score: int("score").default(0).notNull(),
  certCode: varchar("certCode", { length: 64 }).unique().notNull(),
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
});
export type CourseCompletionCert = typeof courseCompletionCerts.$inferSelect;
