import * as service from "./service";

export const get = ({ ctx }: any) => service.get(ctx.user.id);
