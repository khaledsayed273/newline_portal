import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { sendConsultationEmail, sendTrainingRequestEmail, sendSuggestionEmail } from "./email";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "غير مصرح لك بهذا الإجراء" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  // ========== المصادقة ==========
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ========== الإدارات ==========
  departments: router({
    list: publicProcedure.query(() => db.getDepartments()),
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        order: z.number().optional(),
      }))
      .mutation(({ input }) => db.createDepartment(input)),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        nameEn: z.string().optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        order: z.number().optional(),
      }))
      .mutation(({ input: { id, ...data } }) => db.updateDepartment(id, data)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteDepartment(input.id)),
  }),

  // ========== الدورات ==========
  courses: router({
    list: publicProcedure
      .input(z.object({ departmentId: z.number().optional() }).optional())
      .query(({ input }) => db.getCourses(input?.departmentId)),
    listAll: adminProcedure.query(() => db.getAllCourses()),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getCourseById(input.id)),
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        departmentId: z.number().optional(),
        thumbnailUrl: z.string().optional(),
        duration: z.number().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        isPublished: z.boolean().optional(),
        order: z.number().optional(),
      }))
      .mutation(({ input }) => db.createCourse(input)),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        departmentId: z.number().optional(),
        thumbnailUrl: z.string().optional(),
        duration: z.number().optional(),
        level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        isPublished: z.boolean().optional(),
        order: z.number().optional(),
      }))
      .mutation(({ input: { id, ...data } }) => db.updateCourse(id, data)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteCourse(input.id)),
  }),

  // ========== الإعجابات والمشاهدات ==========
  courseLikes: router({
    toggle: publicProcedure
      .input(z.object({ courseId: z.number(), userId: z.number().optional() }))
      .mutation(({ ctx, input }) => {
        const uid = input.userId ?? ctx.user?.id ?? 0;
        return db.toggleCourseLike(input.courseId, uid);
      }),
    count: publicProcedure
      .input(z.object({ courseId: z.number() }))
      .query(({ input }) => db.getCourseLikesCount(input.courseId)),
    isLiked: publicProcedure
      .input(z.object({ courseId: z.number(), userId: z.number().optional() }))
      .query(({ ctx, input }) => {
        const uid = input.userId ?? ctx.user?.id;
        if (!uid) return false;
        return db.isCourseLiked(input.courseId, uid);
      }),
  }),

  courseViews: router({
    record: publicProcedure
      .input(z.object({ courseId: z.number(), userId: z.number().optional() }))
      .mutation(({ ctx, input }) => {
        const uid = input.userId ?? ctx.user?.id;
        return db.recordCourseView(input.courseId, uid);
      }),
    count: publicProcedure
      .input(z.object({ courseId: z.number() }))
      .query(({ input }) => db.getCourseViewsCount(input.courseId)),
  }),

  // ========== مسارات الدورات ==========
  coursePaths: router({
    byDepartment: publicProcedure
      .input(z.object({ departmentId: z.number() }))
      .query(({ input }) => db.getCoursePathsByDepartment(input.departmentId)),
    withCourses: publicProcedure
      .input(z.object({ pathId: z.number() }))
      .query(({ input }) => db.getCoursePathWithCourses(input.pathId)),
    // جلب مسارات الإدارة مع حالة القفل والإنجاز لكل مستخدم
    byDepartmentWithProgress: publicProcedure
      .input(z.object({ departmentId: z.number(), userIdentifier: z.string() }))
      .query(({ input }) => db.getPathsWithProgressForDepartment(input.userIdentifier, input.departmentId)),
    // جلب إنجاز مسار معين
    getProgress: publicProcedure
      .input(z.object({ pathId: z.number(), userIdentifier: z.string() }))
      .query(({ input }) => db.getPathProgress(input.userIdentifier, input.pathId)),
    // تحديث إنجاز مسار (عند إكمال دورة)
    updateProgress: publicProcedure
      .input(z.object({
        pathId: z.number(),
        userIdentifier: z.string(),
        completedCourses: z.number(),
        totalCourses: z.number(),
      }))
      .mutation(({ input }) =>
        db.upsertPathProgress(input.userIdentifier, input.pathId, input.completedCourses, input.totalCourses)
      ),
    // إصدار شهادة المسار
    issueCertificate: publicProcedure
      .input(z.object({ pathId: z.number(), userIdentifier: z.string() }))
      .mutation(async ({ input }) => {
        const progress = await db.getPathProgress(input.userIdentifier, input.pathId);
        if (!progress?.isCompleted) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "لم يتم إكمال المسار بعد" });
        }
        await db.issueCertificateForPath(input.userIdentifier, input.pathId);
        return { success: true };
      }),
    create: adminProcedure
      .input(z.object({
        departmentId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        order: z.number().optional(),
      }))
      .mutation(({ input }) => db.createCoursePath(input)),
    addCourse: adminProcedure
      .input(z.object({ pathId: z.number(), courseId: z.number(), order: z.number().optional() }))
      .mutation(({ input }) => db.addCourseToPath(input.pathId, input.courseId, input.order)),
    removeCourse: adminProcedure
      .input(z.object({ pathId: z.number(), courseId: z.number() }))
      .mutation(({ input }) => db.removeCourseFromPath(input.pathId, input.courseId)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteCoursePath(input.id)),
  }),

  // ========== دروس الدورة ==========
  lessons: router({
    byCourse: publicProcedure
      .input(z.object({ courseId: z.number() }))
      .query(({ input }) => db.getCourseLessons(input.courseId)),
    allByCourse: adminProcedure
      .input(z.object({ courseId: z.number() }))
      .query(({ input }) => db.getAllCourseLessons(input.courseId)),
    create: adminProcedure
      .input(z.object({
        courseId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        videoType: z.enum(["youtube", "vimeo", "direct", "embed"]).optional(),
        duration: z.number().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(({ input }) => db.createLesson(input)),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        videoUrl: z.string().optional(),
        videoType: z.enum(["youtube", "vimeo", "direct", "embed"]).optional(),
        duration: z.number().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(({ input: { id, ...data } }) => db.updateLesson(id, data)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteLesson(input.id)),
  }),

  // ========== التسجيلات ==========
  enrollments: router({
    myEnrollments: publicProcedure
      .input(z.object({ userId: z.number().optional() }).optional())
      .query(({ ctx, input }) => {
        const uid = input?.userId ?? ctx.user?.id;
        if (!uid) return [];
        return db.getUserEnrollments(uid);
      }),
    enroll: publicProcedure
      .input(z.object({ courseId: z.number(), userId: z.number().optional() }))
      .mutation(({ ctx, input }) => {
        const uid = input.userId ?? ctx.user?.id ?? 0;
        return db.enrollUser({ userId: uid, courseId: input.courseId });
      }),
    updateProgress: publicProcedure
      .input(z.object({
        courseId: z.number(),
        progress: z.number().min(0).max(100),
        completedLessons: z.array(z.number()),
        userId: z.number().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const uid = input.userId ?? ctx.user?.id ?? 0;
        return db.updateEnrollmentProgress(uid, input.courseId, input.progress, input.completedLessons);
      }),
  }),

  // ========== المسارات ==========
  tracks: router({
    list: publicProcedure
      .input(z.object({ departmentId: z.number().optional() }).optional())
      .query(({ input }) => db.getTracks(input?.departmentId)),
    listAll: adminProcedure.query(() => db.getAllTracks()),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getTrackById(input.id)),
    courses: publicProcedure
      .input(z.object({ trackId: z.number() }))
      .query(({ input }) => db.getTrackCourses(input.trackId)),
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        departmentId: z.number().optional(),
        thumbnailUrl: z.string().optional(),
        targetRole: z.string().optional(),
        isPublished: z.boolean().optional(),
        order: z.number().optional(),
      }))
      .mutation(({ input }) => db.createTrack(input)),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        departmentId: z.number().optional(),
        thumbnailUrl: z.string().optional(),
        targetRole: z.string().optional(),
        isPublished: z.boolean().optional(),
        order: z.number().optional(),
      }))
      .mutation(({ input: { id, ...data } }) => db.updateTrack(id, data)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteTrack(input.id)),
    addCourse: adminProcedure
      .input(z.object({ trackId: z.number(), courseId: z.number(), order: z.number().optional(), isRequired: z.boolean().optional() }))
      .mutation(({ input }) => db.addCourseToTrack(input)),
    removeCourse: adminProcedure
      .input(z.object({ trackId: z.number(), courseId: z.number() }))
      .mutation(({ input }) => db.removeCourseFromTrack(input.trackId, input.courseId)),
  }),

  // ========== الملفات المختصرة ==========
  briefFiles: router({
    list: publicProcedure
      .input(z.object({ departmentId: z.number().optional() }).optional())
      .query(({ input }) => db.getBriefFiles(input?.departmentId)),
    listAll: adminProcedure.query(() => db.getAllBriefFiles()),
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        departmentId: z.number().optional(),
        fileUrl: z.string().optional(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
        thumbnailUrl: z.string().optional(),
        isPublished: z.boolean().optional(),
        order: z.number().optional(),
      }))
      .mutation(({ input }) => db.createBriefFile(input)),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        departmentId: z.number().optional(),
        fileUrl: z.string().optional(),
        fileType: z.string().optional(),
        fileSize: z.number().optional(),
        thumbnailUrl: z.string().optional(),
        isPublished: z.boolean().optional(),
        order: z.number().optional(),
      }))
      .mutation(({ input: { id, ...data } }) => db.updateBriefFile(id, data)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteBriefFile(input.id)),
  }),

  // ========== الاختبارات ==========
  quizzes: router({
    list: publicProcedure
      .input(z.object({ departmentId: z.number().optional() }).optional())
      .query(({ input }) => db.getQuizzes(input?.departmentId)),
    listAll: adminProcedure.query(() => db.getAllQuizzes()),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getQuizById(input.id)),
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        courseId: z.number().optional(),
        departmentId: z.number().optional(),
        questions: z.any().optional(),
        passingScore: z.number().optional(),
        timeLimit: z.number().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(({ input }) => db.createQuiz(input)),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        courseId: z.number().optional(),
        departmentId: z.number().optional(),
        questions: z.any().optional(),
        passingScore: z.number().optional(),
        timeLimit: z.number().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(({ input: { id, ...data } }) => db.updateQuiz(id, data)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteQuiz(input.id)),
    myAttempts: publicProcedure
      .input(z.object({ quizId: z.number(), userId: z.number().optional() }))
      .query(({ ctx, input }) => {
        const uid = input.userId ?? ctx.user?.id;
        if (!uid) return [];
        return db.getUserQuizAttempts(uid, input.quizId);
      }),
    submit: publicProcedure
      .input(z.object({
        quizId: z.number(),
        answers: z.array(z.number()),
        score: z.number(),
        isPassed: z.boolean(),
        userId: z.number().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const uid = input.userId ?? ctx.user?.id ?? 0;
        return db.submitQuizAttempt({ userId: uid, quizId: input.quizId, answers: input.answers, score: input.score, isPassed: input.isPassed });
      }),
  }),

  // ========== الشهادات ==========
  certificates: router({
    mine: publicProcedure
      .input(z.object({ userId: z.number().optional() }).optional())
      .query(({ ctx, input }) => {
        const uid = input?.userId ?? ctx.user?.id;
        if (!uid) return [];
        return db.getUserCertificates(uid);
      }),
    all: adminProcedure.query(() => db.getAllCertificates()),
    create: adminProcedure
      .input(z.object({
        userId: z.number(),
        courseId: z.number().optional(),
        trackId: z.number().optional(),
        title: z.string().min(1),
        certificateCode: z.string().optional(),
        fileUrl: z.string().optional(),
      }))
      .mutation(({ input }) => db.createCertificate(input)),
  }),

  // ========== التعثرات ==========
  incidents: router({
    mine: publicProcedure
      .input(z.object({ userId: z.number().optional() }).optional())
      .query(({ ctx, input }) => {
        const uid = input?.userId ?? ctx.user?.id;
        if (!uid) return [];
        return db.getUserIncidents(uid);
      }),
    all: adminProcedure.query(() => db.getAllIncidents()),
    create: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        userId: z.number().optional(),
      }))
      .mutation(({ ctx, input }) => {
        const uid = input.userId ?? ctx.user?.id ?? 0;
        return db.createIncident({ userId: uid, title: input.title, description: input.description, category: input.category, priority: input.priority });
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
        adminNotes: z.string().optional(),
        resolvedAt: z.date().optional(),
      }))
      .mutation(({ input: { id, ...data } }) => db.updateIncident(id, data)),
  }),

  // ========== الأسئلة الشائعة ==========
  faqs: router({
    list: publicProcedure
      .input(z.object({ departmentId: z.number().optional() }).optional())
      .query(({ input }) => db.getFAQs(input?.departmentId)),
    listAll: adminProcedure.query(() => db.getAllFAQs()),
    create: adminProcedure
      .input(z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
        category: z.string().optional(),
        departmentId: z.number().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(({ input }) => db.createFAQ(input)),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        question: z.string().optional(),
        answer: z.string().optional(),
        category: z.string().optional(),
        departmentId: z.number().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(({ input: { id, ...data } }) => db.updateFAQ(id, data)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteFAQ(input.id)),
  }),

  // ========== طلبات التدريب ==========
  trainingRequests: router({
    mine: publicProcedure
      .input(z.object({ userId: z.number().optional() }).optional())
      .query(({ ctx, input }) => {
        const uid = input?.userId ?? ctx.user?.id;
        if (!uid) return [];
        return db.getUserTrainingRequests(uid);
      }),
    all: adminProcedure.query(() => db.getAllTrainingRequests()),
    create: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        requestedDate: z.date().optional(),
        userId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const uid = input.userId ?? ctx.user?.id ?? 0;
        const result = await db.createTrainingRequest({ userId: uid, title: input.title, description: input.description, requestedDate: input.requestedDate });
        // إرسال إيميل للمسؤول
        const user = ctx.user;
        sendTrainingRequestEmail({
          userName: user?.name ?? "متدرب",
          userEmail: user?.email ?? undefined,
          title: input.title,
          description: input.description,
          requestedDate: input.requestedDate,
        }).catch(console.error);
        return result;
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected", "completed"]).optional(),
        adminNotes: z.string().optional(),
      }))
      .mutation(({ input: { id, ...data } }) => db.updateTrainingRequest(id, data)),
  }),

  // ========== الاقتراحات ==========
  suggestions: router({
    mine: publicProcedure
      .input(z.object({ userId: z.number().optional() }).optional())
      .query(({ ctx, input }) => {
        const uid = input?.userId ?? ctx.user?.id;
        if (!uid) return [];
        return db.getUserSuggestions(uid);
      }),
    all: adminProcedure.query(() => db.getAllSuggestions()),
    create: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        category: z.string().optional(),
        userId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const uid = input.userId ?? ctx.user?.id ?? 0;
        const result = await db.createSuggestion({ userId: uid, title: input.title, content: input.content, category: input.category });
        // إرسال إيميل للمسؤول
        const user = ctx.user;
        sendSuggestionEmail({
          userName: user?.name ?? "متدرب",
          userEmail: user?.email ?? undefined,
          title: input.title,
          content: input.content,
          category: input.category,
        }).catch(console.error);
        return result;
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "reviewed", "implemented", "rejected"]).optional(),
        adminNotes: z.string().optional(),
      }))
      .mutation(({ input: { id, ...data } }) => db.updateSuggestion(id, data)),
  }),

  // ========== الوصف الوظيفي ==========
  jobDescriptions: router({
    list: publicProcedure
      .input(z.object({ departmentId: z.number().optional() }).optional())
      .query(({ input }) => db.getJobDescriptions(input?.departmentId)),
    listAll: adminProcedure.query(() => db.getAllJobDescriptions()),
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        departmentId: z.number().optional(),
        responsibilities: z.array(z.string()).optional(),
        requirements: z.array(z.string()).optional(),
        fileUrl: z.string().optional(),
        isPublished: z.boolean().optional(),
        order: z.number().optional(),
      }))
      .mutation(({ input }) => db.createJobDescription(input)),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        departmentId: z.number().optional(),
        responsibilities: z.array(z.string()).optional(),
        requirements: z.array(z.string()).optional(),
        fileUrl: z.string().optional(),
        isPublished: z.boolean().optional(),
        order: z.number().optional(),
      }))
      .mutation(({ input: { id, ...data } }) => db.updateJobDescription(id, data)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteJobDescription(input.id)),
  }),

  // ========== المستخدمون (للمدير) ==========
  users: router({
    all: adminProcedure.query(() => db.getAllUsers()),
    updateRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(({ input }) => db.updateUserRole(input.userId, input.role)),
  }),

    // ========== الإحصائيات ==========
  stats: router({
    overview: publicProcedure.query(() => db.getStats()),
  }),
  // ========== تتبع مشاهدة الدروس ==========
  lessonWatch: router({
    getProgress: publicProcedure
      .input(z.object({ userIdentifier: z.string(), lessonId: z.number() }))
      .query(({ input }) => db.getLessonWatchProgress(input.userIdentifier, input.lessonId)),
    updateProgress: publicProcedure
      .input(z.object({
        userIdentifier: z.string(),
        lessonId: z.number(),
        courseId: z.number(),
        watchedSeconds: z.number(),
        totalSeconds: z.number(),
      }))
      .mutation(({ input }) =>
        db.upsertLessonWatchProgress(
          input.userIdentifier,
          input.lessonId,
          input.courseId,
          input.watchedSeconds,
          input.totalSeconds
        )
      ),
    getCourseProgress: publicProcedure
      .input(z.object({ userIdentifier: z.string(), courseId: z.number() }))
      .query(({ input }) => db.getCourseWatchProgress(input.userIdentifier, input.courseId)),
    // إعادة حساب إنجاز المسار بعد إكمال درس
    recalcPathProgress: publicProcedure
      .input(z.object({ userIdentifier: z.string(), courseId: z.number() }))
      .mutation(({ input }) => db.recalcPathProgressForUser(input.userIdentifier, input.courseId)),
  }),
  // ========== الخارطة التدريبية ==========
  trainingMap: router({
    getAll: publicProcedure
      .input(z.object({ departmentId: z.number().optional(), isRequired: z.boolean().optional() }))
      .query(({ input }) => db.getTrainingMapCourses(input.departmentId, input.isRequired)),
    getStats: publicProcedure.query(() => db.getTrainingMapStats()),
  }),

  // ========== المكتبة التدريبية ==========
  library: router({
    getAll: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        source: z.string().optional(),
        search: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(({ input }) => db.getLibraryResources(input.category, input.source, input.search, input.page, input.limit)),
    getCategories: publicProcedure.query(() => db.getLibraryCategories()),
    getSources: publicProcedure.query(() => db.getLibrarySources()),
    getStats: publicProcedure.query(() => db.getLibraryStats()),
  }),

  // ========== تقييم الانطباع عن الدورة ==========
  courseRating: router({
    submit: publicProcedure
      .input(z.object({
        courseId: z.number(),
        userIdentifier: z.string(),
        q1: z.number().min(1).max(5),
        q2: z.number().min(1).max(5),
        q3: z.number().min(1).max(5),
        q4: z.number().min(1).max(5),
        q5: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(({ input }) => db.submitCourseRating(input)),
    getForCourse: publicProcedure
      .input(z.object({ courseId: z.number(), userIdentifier: z.string() }))
      .query(({ input }) => db.getCourseRating(input.courseId, input.userIdentifier)),
  }),

  // ========== اختبار الدورة ==========
  courseExam: router({
    getByCourse: publicProcedure
      .input(z.object({ courseId: z.number() }))
      .query(({ input }) => db.getCourseExam(input.courseId)),
    submit: publicProcedure
      .input(z.object({
        courseId: z.number(),
        userIdentifier: z.string(),
        answers: z.array(z.number()),
      }))
      .mutation(({ input }) => db.submitCourseExam(input)),
    getAttempt: publicProcedure
      .input(z.object({ courseId: z.number(), userIdentifier: z.string() }))
      .query(({ input }) => db.getCourseExamAttempt(input.courseId, input.userIdentifier)),
    // للمدير: إضافة/تعديل اختبار
    upsert: adminProcedure
      .input(z.object({
        courseId: z.number(),
        questions: z.array(z.object({
          id: z.number(),
          question: z.string(),
          options: z.array(z.string()).length(4),
          correctAnswer: z.number().min(0).max(3),
        })).length(10),
        passingScore: z.number().default(70),
      }))
      .mutation(({ input }) => db.upsertCourseExam(input)),
  }),

  // ========== شهادة إتمام الدورة ==========
  courseCert: router({
    get: publicProcedure
      .input(z.object({ courseId: z.number(), userIdentifier: z.string() }))
      .query(({ input }) => db.getCourseCompletionCert(input.courseId, input.userIdentifier)),
    issue: publicProcedure
      .input(z.object({
        courseId: z.number(),
        userIdentifier: z.string(),
        fullName: z.string(),
        employeeId: z.string(),
        courseName: z.string(),
        departmentName: z.string().optional(),
        score: z.number(),
      }))
      .mutation(({ input }) => db.issueCourseCompletionCert(input)),
    getByCode: publicProcedure
      .input(z.object({ certCode: z.string() }))
      .query(({ input }) => db.getCourseCompletionCertByCode(input.certCode)),
  }),

  // ========== إحصائيات المتدرب الشخصية ==========
  traineeStats: router({
    get: publicProcedure
      .input(z.object({ userIdentifier: z.string() }))
      .query(async ({ input }) => {
        const { userIdentifier } = input;
        // عدد الدورات المكتملة (= عدد الشهادات)
        const certs = await db.getTraineeCerts(userIdentifier);
        const completedCourses = certs.length;
        // النقاط: نقطة لكل دورة مكتملة
        const points = completedCourses;
        // نسبة الإنجاز: 5% لكل دورة مكتملة (حتى 100%)
        const completionRate = Math.min(completedCourses * 5, 100);
        // عدد الاستشارات (من جدول consultations إن وجد)
        const consultations = await db.getTraineeConsultationsCount(userIdentifier);
        return { points, completedCourses, completionRate, certificates: completedCourses, consultations };
      }),
  }),

  // ========== الاستشارات ==========
  consultations: router({
    create: publicProcedure
      .input(z.object({
        subject: z.string().min(1),
        message: z.string().min(10),
        userName: z.string().optional(),
        userEmail: z.string().optional(),
        department: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        const result = await sendConsultationEmail({
          userName: input.userName ?? user?.name ?? "متدرب",
          userEmail: input.userEmail ?? user?.email ?? undefined,
          subject: input.subject,
          message: input.message,
          department: input.department,
        });
        if (!result.success) {
          // لا نرمي خطأ - نسجّل فقط حتى لا يتأثر المستخدم بمشكلة SMTP
          console.warn("[Consultation] Email not sent:", result.error);
        }
        return { success: true, emailSent: result.success };
      }),
  }),
  // ========== بيانات المتدرب ==========
  traineeProfile: router({
    get: publicProcedure
      .input(z.object({ userIdentifier: z.string() }))
      .query(({ input }) => db.getTraineeProfile(input.userIdentifier)),
    upsert: publicProcedure
      .input(z.object({
        userIdentifier: z.string(),
        fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
        employeeId: z.string().min(1, "الرقم الوظيفي مطلوب"),
      }))
      .mutation(({ input }) =>
        db.upsertTraineeProfile(input.userIdentifier, input.fullName, input.employeeId)
      ),
  }),
});
export type AppRouter = typeof appRouter;
