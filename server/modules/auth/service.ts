import { hashPassword, verifyPassword } from "../../_core/password";
import * as repository from "./repository";

export const authenticate = async (
  employeeNumber: string,
  password: string
) => {
  const user = await repository.getUserByEmployeeNumber(employeeNumber.trim());
  if (
    !user ||
    !user.passwordHash ||
    !(await verifyPassword(password, user.passwordHash))
  )
    return null;
  return user;
};
export const changePassword = (
  userId: number,
  currentHash: string | null,
  currentPassword: string,
  newPassword: string
) =>
  verifyPassword(currentPassword, currentHash ?? "").then(async valid => {
    if (!valid) return false;
    await repository.setUserPassword(userId, await hashPassword(newPassword));
    return true;
  });
