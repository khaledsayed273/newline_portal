import { hashPassword } from "../../_core/password";
import * as repository from "./repository";
export const all = async () =>
  (await repository.getAllUsers()).map(
    ({ passwordHash: _passwordHash, ...user }) => ({
      ...user,
      hasLocalLogin: !!_passwordHash,
    })
  );
export const create = async (data: any) =>
  repository.createLocalUser({
    ...data,
    passwordHash: await hashPassword(data.password),
  });
export const update = async (userId: number, data: any) =>
  repository.updateUser(userId, {
    ...data,
    passwordHash: data.password ? await hashPassword(data.password) : undefined,
  });
export const resetPassword = async (userId: number, password: string) =>
  repository.setUserPassword(userId, await hashPassword(password));
export {
  getUserByEmployeeNumber,
  updateUserRole,
  deleteUser,
} from "./repository";
