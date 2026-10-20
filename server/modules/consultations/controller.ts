import * as service from "./service";

export const create = ({ ctx, input }: any) =>
  service.create({
    ...input,
    userName: input.userName ?? ctx.user?.name ?? "متدرب",
  });
