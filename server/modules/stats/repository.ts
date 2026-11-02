import { and, asc, count, eq, isNull, or } from "drizzle-orm";
import { getUserIncidents } from "../incidents/repository";
import { getAllUserCertificates } from "../certificates/repository";
import {
  briefFiles,
  certificates,
  courseCompletionCerts,
  courseExamAttempts,
  courseExams,
  courseRatings,
  courses,
  departments,
  enrollments,
  getDb,
  incidents,
  pathProgress,
  quizAttempts,
  quizzes,
  tracks,
  trainingRequests,
  users,
} from "../../infrastructure/database";

// ========== الإحصائيات ==========
export async function getStats() {
  const db = await getDb();
  if (!db) return null;
  const [usersCount] = await db
    .select({ count: count() })
    .from(users);
  const [coursesCount] = await db
    .select({ count: count() })
    .from(courses);
  const [tracksCount] = await db
    .select({ count: count() })
    .from(tracks);
  const [briefFilesCount] = await db
    .select({ count: count() })
    .from(briefFiles);
  const [enrollmentsCount] = await db
    .select({ count: count() })
    .from(enrollments);
  const [adminCertificatesCount] = await db
    .select({ count: count() })
    .from(certificates);
  const [courseCertificatesCount] = await db
    .select({ count: count() })
    .from(courseCompletionCerts);
  const [pathCertificatesCount] = await db
    .select({ count: count() })
    .from(pathProgress)
    .where(eq(pathProgress.isCompleted, true));
  const [incidentsCount] = await db
    .select({ count: count() })
    .from(incidents);
  const [pendingRequestsCount] = await db
    .select({ count: count() })
    .from(trainingRequests)
    .where(eq(trainingRequests.status, "pending"));
  return {
    users: Number(usersCount?.count ?? 0),
    courses: Number(coursesCount?.count ?? 0),
    tracks: Number(tracksCount?.count ?? 0),
    briefFiles: Number(briefFilesCount?.count ?? 0),
    enrollments: Number(enrollmentsCount?.count ?? 0),
    certificates:
      Number(adminCertificatesCount?.count ?? 0) +
      Number(courseCertificatesCount?.count ?? 0) +
      Number(pathCertificatesCount?.count ?? 0),
    incidents: Number(incidentsCount?.count ?? 0),
    pendingRequests: Number(pendingRequestsCount?.count ?? 0),
  };
}

export async function getEmployeeStats() {
  const db = await getDb();
  if (!db) return [];
  const employeeRows = await db
    .select()
    .from(users)
    .where(eq(users.role, "user"))
    .orderBy(asc(users.name));
  const [allEnrollments, adminCerts, courseCerts, completedPaths] =
    await Promise.all([
      db.select().from(enrollments),
      db.select().from(certificates),
      db.select().from(courseCompletionCerts),
      db.select().from(pathProgress).where(eq(pathProgress.isCompleted, true)),
    ]);
  return employeeRows.map(employee => {
    const employeeEnrollments = allEnrollments.filter(
      row => row.userId === employee.id
    );
    const completedCourses = employeeEnrollments.filter(
      row => row.isCompleted
    ).length;
    const inProgress = employeeEnrollments.filter(
      row => !row.isCompleted && (row.progress ?? 0) > 0
    ).length;
    const averageProgress = employeeEnrollments.length
      ? Math.round(
          employeeEnrollments.reduce(
            (total, row) => total + (row.progress ?? 0),
            0
          ) / employeeEnrollments.length
        )
      : 0;
    return {
      id: employee.id,
      employeeNumber: employee.employeeNumber,
      name: employee.name,
      departmentId: employee.departmentId,
      department: employee.department,
      jobTitle: employee.jobTitle,
      completedCourses,
      inProgress,
      totalEnrollments: employeeEnrollments.length,
      completionRate: averageProgress,
      certificates:
        adminCerts.filter(row => row.userId === employee.id).length +
        courseCerts.filter(row => row.userId === employee.id).length +
        completedPaths.filter(row => row.userId === employee.id).length,
    };
  });
}

export async function getEmployeeDetails(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const [employee] = await db
    .select({
      id: users.id,
      employeeNumber: users.employeeNumber,
      name: users.name,
      departmentId: users.departmentId,
      department: users.department,
      jobTitle: users.jobTitle,
      departmentName: departments.name,
    })
    .from(users)
    .leftJoin(departments, eq(departments.id, users.departmentId))
    .where(and(eq(users.id, userId), eq(users.role, "user")))
    .limit(1);
  if (!employee) return null;

  const courseRows = await db
    .select()
    .from(courses)
    .where(
      and(
        eq(courses.isPublished, true),
        or(eq(courses.departmentId, employee.departmentId!), isNull(courses.departmentId))
      )
    )
    .orderBy(asc(courses.order), asc(courses.id));
  const [employeeEnrollments, exams, examAttempts, ratings, quizRows, quizAttemptsRows] =
    await Promise.all([
      db.select().from(enrollments).where(eq(enrollments.userId, userId)),
      db.select().from(courseExams),
      db.select().from(courseExamAttempts).where(eq(courseExamAttempts.userId, userId)),
      db.select().from(courseRatings).where(eq(courseRatings.userId, userId)),
      db
        .select()
        .from(quizzes)
        .where(
          and(
            eq(quizzes.isPublished, true),
            or(eq(quizzes.departmentId, employee.departmentId!), isNull(quizzes.departmentId))
          )
        )
        .orderBy(asc(quizzes.courseId), asc(quizzes.id)),
      db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)),
    ]);
  const latestAttempt = <T extends { attemptedAt: Date; id: number }>(
    rows: T[],
    predicate: (row: T) => boolean
  ) =>
    rows
      .filter(predicate)
      .sort(
        (a, b) =>
          b.attemptedAt.getTime() - a.attemptedAt.getTime() || b.id - a.id
      )[0];

  const parseJson = (value: unknown, fallback: any = null) => {
    if (value === null || value === undefined) return fallback;
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const coursesResult = courseRows.map(row => {
    const enrollment = employeeEnrollments.find(item => item.courseId === row.id);
    const exam = exams.find(item => item.courseId === row.id);
    const attempt = latestAttempt(
      examAttempts,
      item => item.courseId === row.id
    );
    const rating = ratings.find(item => item.courseId === row.id);
    return {
    id: row.id,
    title: row.title,
    description: row.description,
    thumbnailUrl: row.thumbnailUrl,
    duration: row.duration,
    enrollment: enrollment
      ? {
          id: enrollment.id,
          progress: Number(enrollment.progress ?? 0),
          completedLessons: parseJson(enrollment.completedLessons, []),
          isCompleted: enrollment.isCompleted,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
        }
      : null,
    exam: exam
      ? {
          questions: parseJson(exam.questions, []),
          answers: parseJson(attempt?.answers, null),
          score: attempt?.score === undefined ? null : Number(attempt.score),
          isPassed: attempt?.isPassed === undefined ? null : attempt.isPassed,
          passingScore: Number(exam.passingScore ?? 70),
          attemptedAt: attempt?.attemptedAt ?? null,
        }
      : null,
    rating:
      !rating
        ? null
        : {
            q1: rating.q1,
            q2: rating.q2,
            q3: rating.q3,
            q4: rating.q4,
            q5: rating.q5,
            average:
              (rating.q1 + rating.q2 + rating.q3 + rating.q4 + rating.q5) /
              5,
            comment: rating.comment,
            createdAt: rating.createdAt,
          },
  }});

  const quizzesResult = quizRows.map(row => {
    const attempt = latestAttempt(
      quizAttemptsRows,
      item => item.quizId === row.id
    );
    return {
    id: row.id,
    courseId: row.courseId === null ? null : Number(row.courseId),
    title: row.title,
    questions: parseJson(row.questions, []),
    answers: parseJson(attempt?.answers, null),
    score: attempt?.score === undefined ? null : Number(attempt.score),
    isPassed: attempt?.isPassed === undefined ? null : attempt.isPassed,
    passingScore: Number(row.passingScore ?? 60),
    attemptedAt: attempt?.attemptedAt ?? null,
  }; });

  const [certificates, employeeIncidents] = await Promise.all([
    getAllUserCertificates(userId),
    getUserIncidents(userId),
  ]);

  return {
    employee: {
      id: Number(employee.id),
      employeeNumber: employee.employeeNumber,
      name: employee.name,
      departmentId: employee.departmentId,
      department: employee.departmentName ?? employee.department,
      jobTitle: employee.jobTitle,
    },
    summary: {
       requiredCourses: coursesResult.length,
       enrolledCourses: coursesResult.filter(course => course.enrollment).length,
       completedCourses: coursesResult.filter(course => course.enrollment?.isCompleted)
        .length,
       inProgressCourses: coursesResult.filter(
        course =>
          course.enrollment &&
          !course.enrollment.isCompleted &&
          course.enrollment.progress > 0
      ).length,
      passedExams:
         coursesResult.filter(course => course.exam?.isPassed).length +
         quizzesResult.filter(quiz => quiz.isPassed).length,
       totalExams: coursesResult.filter(course => course.exam).length + quizzesResult.length,
      certificates: certificates.length,
    },
    courses: coursesResult,
    quizzes: quizzesResult,
    certificates,
    incidents: employeeIncidents,
  };
}
