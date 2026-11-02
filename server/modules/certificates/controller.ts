import * as service from "./service";
export const mine = ({ ctx, input }: any) => {
  return service.mine(ctx.user.id);
};
export const all = () => service.all();
export const allForAdmin = () => service.allForAdmin();
export const employee = ({ input }: any) => service.employee(input.userId);
export const create = ({ input }: any) => service.create(input);
