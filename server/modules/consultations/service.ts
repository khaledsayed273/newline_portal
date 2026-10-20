import * as repository from "./repository";

export const create = async (input: any) => {
  const result = await repository.sendConsultationEmail({
    userName: input.userName,
    subject: input.subject,
    message: input.message,
    department: input.department,
  });
  if (!result.success) {
    console.warn("[Consultation] Email not sent:", result.error);
  }
  return { success: true, emailSent: result.success };
};
