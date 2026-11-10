import { sendConsultationEmail } from "../../email";
import * as service from "./service";
import { getDepartments } from "../departments/repository";

export const mine = ({ ctx, input }: any) => {
  const uid = input?.userId ?? ctx.user?.id;
  return uid ? service.mine(uid) : [];
};

export const all = () => service.all();

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
  const result = await service.create({
    userId: input.userId ?? ctx.user?.id ?? null,
    userName: input.userName ?? ctx.user?.name ?? "متدرب",
    userEmail: input.userEmail,
    department,
    subject: input.subject,
    message: input.message,
    status: "new",
  });
  sendConsultationEmail({
    userName: input.userName ?? ctx.user?.name ?? "متدرب",
    subject: input.subject,
    message: input.message,
    department,
  }).catch(console.error);
  return result;
};

export const update = ({ input: { id, ...data } }: any) =>
  service.update(id, data);
