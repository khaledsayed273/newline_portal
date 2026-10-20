import * as service from "./service";

export const getAll = ({ input }: any) =>
  service.getAll(input.departmentId, input.isRequired);
export const getStats = () => service.getStats();
