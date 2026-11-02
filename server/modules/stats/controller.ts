import * as service from "./service";

export const overview = () => service.getStats();
export const employees = () => service.getEmployeeStats();
export const employeeDetails = ({ input }: any) => service.getEmployeeDetails(input.userId);
