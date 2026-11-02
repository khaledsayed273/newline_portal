import { desc, eq } from "drizzle-orm";
import { ENV } from "../../_core/env";
import { getDb, InsertUser, User, users } from "../../infrastructure/database";

// ========== المستخدمون ==========
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.employeeNumber)
    throw new Error("User employeeNumber is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { employeeNumber: user.employeeNumber };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name"] as const;
    textFields.forEach(field => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    });
    if (user.passwordHash !== undefined) {
      values.passwordHash = user.passwordHash;
      updateSet.passwordHash = user.passwordHash;
    }
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.employeeNumber === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0)
      updateSet.lastSignedIn = new Date();
    await db
      .insert(users)
      .values(values)
      .onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByEmployeeNumber(
  employeeNumber: string
): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.employeeNumber, employeeNumber))
    .limit(1);
  return result[0];
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(
  userId: number,
  role: "user" | "admin"
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function updateUser(
  userId: number,
  data: {
    name?: string;
    employeeNumber?: string;
    role?: "user" | "admin";
    passwordHash?: string;
    departmentId?: number | null;
    department?: string | null;
    jobTitle?: string | null;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const set: Record<string, unknown> = {};
  if (data.name !== undefined) set.name = data.name;
  if (data.employeeNumber !== undefined)
    set.employeeNumber = data.employeeNumber;
  if (data.role !== undefined) set.role = data.role;
  if (data.passwordHash !== undefined) set.passwordHash = data.passwordHash;
  if (data.departmentId !== undefined) set.departmentId = data.departmentId;
  if (data.department !== undefined) set.department = data.department;
  if (data.jobTitle !== undefined) set.jobTitle = data.jobTitle;
  if (Object.keys(set).length === 0) return;
  await db.update(users).set(set).where(eq(users.id, userId));
}

// == الدخول المحلي (أوفلاين، بدون Manus) ==
export async function createLocalUser(data: {
  employeeNumber: string;
  name?: string | null;
  passwordHash: string;
  role?: "user" | "admin";
  departmentId?: number;
  department?: string | null;
  jobTitle?: string | null;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(users).values({
    employeeNumber: data.employeeNumber,
    name: data.name ?? null,
    passwordHash: data.passwordHash,
    role: data.role ?? "user",
    departmentId: data.departmentId,
    department: data.department ?? null,
    jobTitle: data.jobTitle ?? null,
    lastSignedIn: new Date(),
  });
}

export async function setUserPassword(
  userId: number,
  passwordHash: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function deleteUser(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(users).where(eq(users.id, userId));
}

// ========== بيانات المتدرب (من جدول المستخدمين) ==========
export async function getTraineeProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select({
      id: users.id,
      fullName: users.name,
      employeeId: users.employeeNumber,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row ?? null;
}

export async function upsertTraineeProfile(
  userId: number,
  fullName: string,
  employeeId: string
) {
  const db = await getDb();
  if (!db) return null;
  await updateUser(userId, {
    name: fullName,
    employeeNumber: employeeId,
  });
  return { userId, fullName, employeeId };
}
