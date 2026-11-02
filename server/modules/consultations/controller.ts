import * as service from "./service";
import { getDepartments } from "../departments/repository";

export const create = async ({ ctx, input }: any) => {
  let department = input.department;
  if (ctx.user.role !== "admin") {
    if (!ctx.user.departmentId) {
      throw new Error("لا يمكن إرسال الاستشارة قبل ربط الحساب بإدارة");
    }
    const departments = await getDepartments();
    department = departments.find(d => d.id === ctx.user.departmentId)?.name;
    if (!department) throw new Error("الإدارة المرتبطة بالحساب غير موجودة");
  }
  return service.create({
    ...input,
    department,
    userName: input.userName ?? ctx.user.name ?? "متدرب",
  });
};
