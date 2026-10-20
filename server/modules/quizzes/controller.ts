import * as service from "./service";
export const list = ({ input }: any) => service.list(input?.departmentId);
export const listAll = () => service.listAll();
export const byId = ({ input }: any) => service.byId(input.id);
export const create = ({ input }: any) => service.create(input);
export const update = ({ input: { id, ...data } }: any) =>
  service.update(id, data);
export const remove = ({ input }: any) => service.remove(input.id);
export const myAttempts = ({ ctx, input }: any) => {
  const uid = input.userId ?? ctx.user?.id;
  return uid ? service.attempts(uid, input.quizId) : [];
};
export const submit = ({ ctx, input }: any) =>
  service.submit({
    userId: input.userId ?? ctx.user?.id ?? 0,
    quizId: input.quizId,
    answers: input.answers,
    score: input.score,
    isPassed: input.isPassed,
  });
