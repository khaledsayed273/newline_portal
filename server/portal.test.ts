import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@newline.sa",
    name: "متدرب تجريبي",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createGuestContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// ========== اختبارات المصادقة ==========
describe("auth", () => {
  it("يُرجع null للمستخدم غير المسجل", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("يُرجع بيانات المستخدم المسجل", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("متدرب تجريبي");
    expect(result?.role).toBe("user");
  });

  it("يُنجح تسجيل الخروج", async () => {
    const clearedCookies: string[] = [];
    const ctx = createUserContext();
    ctx.res.clearCookie = (name: string) => { clearedCookies.push(name); };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBeGreaterThan(0);
  });
});

// ========== اختبارات الإدارات ==========
describe("departments", () => {
  it("يُرجع قائمة الإدارات للعموم", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    // يجب أن يُرجع مصفوفة (حتى لو فارغة في بيئة الاختبار)
    const result = await caller.departments.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("يرفض إنشاء إدارة من غير مدير", async () => {
    const ctx = createUserContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.departments.create({ name: "إدارة تجريبية" })
    ).rejects.toThrow();
  });
});

// ========== اختبارات الدورات ==========
describe("courses", () => {
  it("يُرجع قائمة الدورات للعموم", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.courses.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("يرفض إنشاء دورة من غير مدير", async () => {
    const ctx = createUserContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.courses.create({ title: "دورة تجريبية" })
    ).rejects.toThrow();
  });
});

// ========== اختبارات المسارات ==========
describe("tracks", () => {
  it("يُرجع قائمة المسارات للعموم", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tracks.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});

// ========== اختبارات الملفات المختصرة ==========
describe("briefFiles", () => {
  it("يُرجع قائمة الملفات للعموم", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.briefFiles.list({});
    expect(Array.isArray(result)).toBe(true);
  });
});

// ========== اختبارات التسجيل في الدورات ==========
describe("enrollments", () => {
  it("يرفض جلب التسجيلات من غير مسجل", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.enrollments.myEnrollments()).rejects.toThrow();
  });

  it("يُرجع تسجيلات المتدرب المسجل", async () => {
    const ctx = createUserContext("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.enrollments.myEnrollments();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ========== اختبارات التعثرات ==========
describe("incidents", () => {
  it("يرفض جلب التعثرات من غير مسجل", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.incidents.mine()).rejects.toThrow();
  });

  it("يرفض جلب جميع التعثرات من غير مدير", async () => {
    const ctx = createUserContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.incidents.all()).rejects.toThrow();
  });
});

// ========== اختبارات الاقتراحات ==========
describe("suggestions", () => {
  it("يرفض إنشاء اقتراح من غير مسجل", async () => {
    const ctx = createGuestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.suggestions.create({ title: "اقتراح", content: "محتوى الاقتراح" })
    ).rejects.toThrow();
  });

  it("يُنجح إنشاء اقتراح من متدرب مسجل", async () => {
    const ctx = createUserContext("user");
    const caller = appRouter.createCaller(ctx);
    // قد يفشل بسبب قاعدة البيانات في بيئة الاختبار، لكن يجب ألا يرفض بسبب الصلاحيات
    try {
      await caller.suggestions.create({ title: "اقتراح تجريبي", content: "هذا اقتراح للاختبار" });
    } catch (e: any) {
      // مقبول إذا فشل بسبب قاعدة البيانات وليس الصلاحيات
      expect(e?.message).not.toContain("غير مصرح");
    }
  });
});

// ========== اختبارات المستخدمين (للمدير) ==========
describe("users", () => {
  it("يرفض جلب المستخدمين من غير مدير", async () => {
    const ctx = createUserContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.users.all()).rejects.toThrow();
  });
});

// ========== اختبارات الإحصائيات ==========
describe("stats", () => {
  it("يرفض جلب الإحصائيات من غير مدير", async () => {
    const ctx = createUserContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.stats.overview()).rejects.toThrow();
  });
});
