import { TRPCError } from "@trpc/server";
import * as service from "./service";
export const all = () => service.all();
export const updateRole = ({ input }: any) =>
  service.updateUserRole(input.userId, input.role);
export const create = async ({ input }: any) => {
  const employeeNumber = input.employeeNumber.trim();
  if (await service.getUserByEmployeeNumber(employeeNumber))
    throw new TRPCError({
      code: "CONFLICT",
      message: "هذا الرقم الوظيفي مسجّل بالفعل",
    });
  await service.create({
    employeeNumber,
    name: input.name.trim(),
    password: input.password,
    role: input.role ?? "user",
  });
  return { success: true } as const;
};
export const update = async ({ input, ctx }: any) => {
  if (input.userId === ctx.user.id && input.role && input.role !== "admin")
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "لا يمكنك إزالة صلاحية المدير عن نفسك",
    });
  if (input.employeeNumber) {
    const existing = await service.getUserByEmployeeNumber(
      input.employeeNumber.trim()
    );
    if (existing && existing.id !== input.userId)
      throw new TRPCError({
        code: "CONFLICT",
        message: "هذا الرقم الوظيفي مسجّل بالفعل",
      });
  }
  await service.update(input.userId, {
    name: input.name?.trim(),
    employeeNumber: input.employeeNumber?.trim(),
    role: input.role,
    password: input.password,
  });
  return { success: true } as const;
};
export const resetPassword = async ({ input, ctx }: any) => {
  if (input.userId === ctx.user.id)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "لا يمكنك تصفير كلمة مرورك من هنا",
    });
  await service.resetPassword(input.userId, input.password);
  return { success: true } as const;
};
export const remove = ({ input, ctx }: any) => {
  if (input.userId === ctx.user.id)
    throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكنك حذف حسابك" });
  return service.deleteUser(input.userId);
};

export const updateProfile = async ({ input, ctx }: any) => {
  await service.update(ctx.user.id, {
    name: input.fullName.trim(),
    employeeNumber: input.employeeId.trim(),
  });
  return { success: true } as const;
};
