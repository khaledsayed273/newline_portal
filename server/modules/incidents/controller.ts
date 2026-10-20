import * as service from "./service";
export const mine = ({ ctx, input }: any) => {
  const uid = input?.userId ?? ctx.user?.id;
  return uid ? service.mine(uid) : [];
};
export const all = () => service.all();
export const create = ({ ctx, input }: any) =>
  service.create({
    userId: input.userId ?? ctx.user?.id ?? 0,
    title: input.title,
    description: input.description,
    category: input.category,
    priority: input.priority,
  });
export const update = ({ input: { id, ...data } }: any) =>
  service.update(id, data);
