import * as service from "./service";
export const mine = ({ ctx, input }: any) => {
  const uid = input?.userId ?? ctx.user?.id;
  return uid ? service.mine(uid) : [];
};
export const all = () => service.all();
export const create = ({ input }: any) => service.create(input);
