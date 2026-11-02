import { and, desc, eq } from "drizzle-orm";
import {
  certificates,
  Certificate,
  courseCompletionCerts,
  departments,
  getDb,
  InsertCertificate,
  pathProgress,
  coursePaths,
  users,
} from "../../infrastructure/database";

// ========== الشهادات ==========
export async function getUserCertificates(
  userId: number
): Promise<Certificate[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(certificates)
    .where(eq(certificates.userId, userId))
    .orderBy(desc(certificates.issuedAt));
}

export async function getAllCertificates(): Promise<Certificate[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificates).orderBy(desc(certificates.issuedAt));
}

// جميع الشهادات التي يمكن أن يحصل عليها الموظف، مع بيانات صاحب الشهادة.
// شهادات إتمام الدورة والمسار لا تُحفظ في جدول certificates.
export async function getAllCertificatesForAdmin() {
  const db = await getDb();
  if (!db) return [];
  const adminRows = await db
    .select({
      id: certificates.id,
      userId: certificates.userId,
      employeeNumber: users.employeeNumber,
      userName: users.name,
      title: certificates.title,
      issuedAt: certificates.issuedAt,
      certificateCode: certificates.certificateCode,
      courseId: certificates.courseId,
    })
    .from(certificates)
    .leftJoin(users, eq(users.id, certificates.userId));
  const courseRows = await db
    .select({
      id: courseCompletionCerts.id,
      userId: courseCompletionCerts.userId,
      employeeNumber: users.employeeNumber,
      userName: users.name,
      employeeId: courseCompletionCerts.employeeId,
      fullName: courseCompletionCerts.fullName,
      title: courseCompletionCerts.courseName,
      issuedAt: courseCompletionCerts.issuedAt,
      certificateCode: courseCompletionCerts.certCode,
      courseId: courseCompletionCerts.courseId,
      departmentName: courseCompletionCerts.departmentName,
    })
    .from(courseCompletionCerts)
    .leftJoin(users, eq(users.id, courseCompletionCerts.userId));
  const pathRows = await db
    .select({
      id: pathProgress.pathId,
      userId: pathProgress.userId,
      employeeNumber: users.employeeNumber,
      userName: users.name,
      title: coursePaths.name,
      issuedAt: pathProgress.completedAt,
      departmentName: departments.name,
    })
    .from(pathProgress)
    .innerJoin(coursePaths, eq(coursePaths.id, pathProgress.pathId))
    .leftJoin(departments, eq(departments.id, coursePaths.departmentId))
    .leftJoin(users, eq(users.id, pathProgress.userId))
    .where(eq(pathProgress.isCompleted, true));
  return [
    ...adminRows.map(row => ({
      ...row,
      kind: "admin" as const,
      pathId: null,
      departmentName: null,
    })),
    ...courseRows.map(row => ({
      id: row.id,
      userId: row.userId,
      employeeNumber: row.employeeNumber ?? row.employeeId,
      userName: row.userName ?? row.fullName,
      kind: "course" as const,
      title: row.title,
      issuedAt: row.issuedAt,
      certificateCode: row.certificateCode,
      courseId: row.courseId,
      pathId: null,
      departmentName: row.departmentName,
    })),
    ...pathRows.map(row => ({
      ...row,
      kind: "path" as const,
      certificateCode: null,
      courseId: null,
      pathId: row.id,
    })),
  ].sort((a, b) => {
    const aTime = a.issuedAt?.getTime() ?? 0;
    const bTime = b.issuedAt?.getTime() ?? 0;
    return bTime - aTime;
  }) as Array<{
    id: number;
    userId: number;
    employeeNumber: string | null;
    userName: string | null;
    kind: "admin" | "course" | "path";
    title: string;
    issuedAt: Date | null;
    certificateCode: string | null;
    courseId: number | null;
    pathId: number | null;
    departmentName: string | null;
  }>;
}

export async function createCertificate(
  data: InsertCertificate
): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(certificates).values(data);
  return { id: Number(result[0].insertId) };
}

// جميع شهادات المستخدم من المصادر الثلاثة (إدارية / إتمام دورة / إتمام مسار)
export async function getAllUserCertificates(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result: Array<{
    id: number;
    kind: "admin" | "course" | "path";
    title: string;
    issuedAt: Date | null;
    certCode: string | null;
    fileUrl: string | null;
    courseId: number | null;
    pathId: number | null;
    departmentName: string | null;
  }> = [];
  try {
    const adminRows = await db
      .select()
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.issuedAt));
    adminRows.forEach(r => {
      result.push({
        id: r.id,
        kind: "admin" as const,
        title: r.title,
        issuedAt: r.issuedAt ?? null,
        certCode: r.certificateCode ?? null,
        fileUrl: r.fileUrl ?? null,
        courseId: r.courseId ?? null,
        pathId: null,
        departmentName: null,
      });
    });

    const courseRows = await db
      .select()
      .from(courseCompletionCerts)
      .where(eq(courseCompletionCerts.userId, userId))
      .orderBy(desc(courseCompletionCerts.issuedAt));
    courseRows.forEach(r => {
      result.push({
        id: r.id,
        kind: "course" as const,
        title: r.courseName,
        issuedAt: r.issuedAt ?? null,
        certCode: r.certCode ?? null,
        fileUrl: null,
        courseId: r.courseId ?? null,
        pathId: null,
        departmentName: null,
      });
    });

    const pathRows = await db
      .select({
        pathId: pathProgress.pathId,
        completedAt: pathProgress.completedAt,
        name: coursePaths.name,
        departmentName: departments.name,
      })
      .from(pathProgress)
      .innerJoin(coursePaths, eq(coursePaths.id, pathProgress.pathId))
      .leftJoin(departments, eq(departments.id, coursePaths.departmentId))
      .where(
        and(
          eq(pathProgress.userId, userId),
          eq(pathProgress.isCompleted, true)
        )
      )
      .orderBy(desc(pathProgress.completedAt));
    pathRows.forEach(r => {
      result.push({
        id: r.pathId,
        kind: "path" as const,
        title: r.name,
        issuedAt: r.completedAt ?? null,
        certCode: null,
        fileUrl: null,
        courseId: null,
        pathId: r.pathId,
        departmentName: r.departmentName ?? null,
      });
    });
  } catch (error) {
    console.error("[getAllUserCertificates]", error);
  }
  return result;
}

export { getAllUserCertificates as getEmployeeCertificates };
