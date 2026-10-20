import { sendTrainingRequestEmail } from "../../email";
import * as service from "./service";
export const mine = ({ ctx, input }: any) => {
  const uid = input?.userId ?? ctx.user?.id;
  return uid ? service.mine(uid) : [];
};
export const all = () => service.all();

export const create = async ({ ctx, input }: any) => {
  const result = await service.create({
    userId: input.userId ?? ctx.user?.id ?? 0,
    title: input.title,
    description: input.description,
    requestedDate: input.requestedDate,
  });
  sendTrainingRequestEmail({
    userName: ctx.user?.name ?? "متدرب",
    title: input.title,
    description: input.description,
    requestedDate: input.requestedDate,
  }).catch(console.error);
  return result;
};
export const update = ({ input: { id, ...data } }: any) =>
  service.update(id, data);
