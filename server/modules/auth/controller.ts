import { TRPCError } from "@trpc/server";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "../../_core/cookies";
import { sdk } from "../../_core/sdk";
import { hashPassword } from "../../_core/password";
import * as service from "./service";

export const me = ({ ctx }: any) => {
  if (!ctx.user) return null;
  const { passwordHash: _passwordHash, ...safeUser } = ctx.user;
  return safeUser;
};
export const login = async ({ ctx, input }: any) => {
  const user = await service.authenticate(input.employeeNumber, input.password);
  if (!user)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "بيانات الدخول غير صحيحة",
    });
  const token = await sdk.createSessionToken(user.employeeNumber, {
    name: user.name || user.employeeNumber,
  });
  ctx.res.cookie(COOKIE_NAME, token, {
    ...getSessionCookieOptions(ctx.req),
    maxAge: ONE_YEAR_MS,
  });
  return { success: true } as const;
};
export const logout = ({ ctx }: any) => {
  ctx.res.clearCookie(COOKIE_NAME, {
    ...getSessionCookieOptions(ctx.req),
    maxAge: -1,
  });
  return { success: true } as const;
};
export const updatePassword = async ({ ctx, input }: any) => {
  const valid = await service.changePassword(
    ctx.user.id,
    ctx.user.passwordHash,
    input.currentPassword,
    input.newPassword
  );
  if (!valid)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "كلمة المرور الحالية غير صحيحة",
    });
  return { success: true } as const;
};
