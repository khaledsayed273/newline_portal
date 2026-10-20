import * as repository from "./repository";
export const mine = (userId: number) => repository.getAllUserCertificates(userId);
export const all = () => repository.getAllCertificates();
export const create = (input: any) => repository.createCertificate(input);
