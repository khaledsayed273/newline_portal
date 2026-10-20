import * as service from "./service";

export const getAll = ({ input }: any) => service.getAll(input);
export const getCategories = () => service.getCategories();
export const getSources = () => service.getSources();
export const getStats = () => service.getStats();
