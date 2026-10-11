import { Resend } from "resend";
import nodemailer from "nodemailer";

const RECIPIENT_EMAIL = "jza.o@new-line.sa";

// ======= Resend Client =======
function getResendClient() {
  const key = process.env.RESEND_API_KEY;
  if (key) return new Resend(key);
  return null;
}

// ======= Nodemailer fallback =======
function createNodemailerTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });
  }
  return null;
}

// ======= Generic send helper =======
async function sendEmail(opts: {
  html: string;
  emailSubject: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: "بوابة نيولاين للتدريب <onboarding@resend.dev>",
        to: [RECIPIENT_EMAIL],
        subject: opts.emailSubject,
        html: opts.html,
      });
      if (error) throw new Error(error.message);
      console.log("[Email] Sent via Resend:", data?.id);
      return { success: true, messageId: data?.id };
    } catch (err) {
      console.error("[Email] Resend error:", err);
      return { success: false, error: String(err) };
    }
  }

  const transport = createNodemailerTransport();
  if (transport) {
    try {
      const info = await transport.sendMail({
        from: `"بوابة نيولاين للتدريب" <no-reply@new-line.sa>`,
        to: RECIPIENT_EMAIL,
        subject: opts.emailSubject,
        html: opts.html,
      });
      console.log("[Email] Sent via Nodemailer:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error("[Email] Nodemailer error:", err);
      return { success: false, error: String(err) };
    }
  }

  // No transport configured — log to console for debugging
  console.warn("[Email] No transport configured. Please set RESEND_API_KEY environment variable.");
  console.warn("[Email] Subject:", opts.emailSubject);
  return { success: false, error: "No email transport configured. Please set RESEND_API_KEY environment variable." };
}

// ======= Consultation Email =======
export async function sendConsultationEmail(params: {
  userName: string;
  userEmail?: string;
  subject: string;
  message: string;
  department?: string;
}) {
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #d97706, #f59e0b); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">💬 استشارة جديدة - بوابة نيولاين للتدريب</h1>
      </div>
      <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">اسم المتدرب:</td>
            <td style="padding: 8px 0; color: #1f2937;">${params.userName}</td>
          </tr>
          ${params.userEmail ? `<tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">البريد الإلكتروني:</td>
            <td style="padding: 8px 0; color: #1f2937;">${params.userEmail}</td>
          </tr>` : ""}
          ${params.department ? `<tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">الإدارة:</td>
            <td style="padding: 8px 0; color: #1f2937;">${params.department}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">الموضوع:</td>
            <td style="padding: 8px 0; color: #1f2937;">${params.subject}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #fffbeb; border-radius: 8px; border-right: 4px solid #d97706;">
          <p style="font-weight: bold; color: #374151; margin: 0 0 8px 0;">تفاصيل الاستشارة:</p>
          <p style="color: #4b5563; margin: 0; line-height: 1.6;">${params.message}</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 16px; text-align: center;">
          تم الإرسال من بوابة نيولاين للتدريب | ${new Date().toLocaleString("ar-SA")}
        </p>
      </div>
    </div>
  `;
  return sendEmail({
    html,
    emailSubject: `استشارة جديدة: ${params.subject} - ${params.userName}`,
  });
}

// ======= Training Request Email =======
export async function sendTrainingRequestEmail(params: {
  userName: string;
  userEmail?: string;
  title: string;
  description?: string;
  requestedDate?: Date;
}) {
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">📋 طلب تدريب جديد - بوابة نيولاين للتدريب</h1>
      </div>
      <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">اسم المتدرب:</td>
            <td style="padding: 8px 0; color: #1f2937;">${params.userName}</td>
          </tr>
          ${params.userEmail ? `<tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">البريد الإلكتروني:</td>
            <td style="padding: 8px 0; color: #1f2937;">${params.userEmail}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">موضوع التدريب:</td>
            <td style="padding: 8px 0; color: #1f2937;">${params.title}</td>
          </tr>
          ${params.requestedDate ? `<tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">التاريخ المطلوب:</td>
            <td style="padding: 8px 0; color: #1f2937;">${new Date(params.requestedDate).toLocaleDateString("ar-SA")}</td>
          </tr>` : ""}
        </table>
        ${params.description ? `
        <div style="margin-top: 16px; padding: 16px; background: #eff6ff; border-radius: 8px; border-right: 4px solid #2563eb;">
          <p style="font-weight: bold; color: #374151; margin: 0 0 8px 0;">تفاصيل الطلب:</p>
          <p style="color: #4b5563; margin: 0; line-height: 1.6;">${params.description}</p>
        </div>` : ""}
        <p style="color: #9ca3af; font-size: 12px; margin-top: 16px; text-align: center;">
          تم الإرسال من بوابة نيولاين للتدريب | ${new Date().toLocaleString("ar-SA")}
        </p>
      </div>
    </div>
  `;
  return sendEmail({
    html,
    emailSubject: `طلب تدريب: ${params.title} - ${params.userName}`,
  });
}

// ======= Suggestion Email =======
export async function sendSuggestionEmail(params: {
  userName: string;
  userEmail?: string;
  title: string;
  content: string;
  category?: string;
}) {
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px; border-radius: 12px;">
      <div style="background: linear-gradient(135deg, #7c3aed, #a78bfa); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">💡 اقتراح جديد - بوابة نيولاين للتدريب</h1>
      </div>
      <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">اسم المتدرب:</td>
            <td style="padding: 8px 0; color: #1f2937;">${params.userName}</td>
          </tr>
          ${params.userEmail ? `<tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">البريد الإلكتروني:</td>
            <td style="padding: 8px 0; color: #1f2937;">${params.userEmail}</td>
          </tr>` : ""}
          ${params.category ? `<tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">الفئة:</td>
            <td style="padding: 8px 0; color: #1f2937;">${params.category}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #374151;">عنوان الاقتراح:</td>
            <td style="padding: 8px 0; color: #1f2937;">${params.title}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f5f3ff; border-radius: 8px; border-right: 4px solid #7c3aed;">
          <p style="font-weight: bold; color: #374151; margin: 0 0 8px 0;">تفاصيل الاقتراح:</p>
          <p style="color: #4b5563; margin: 0; line-height: 1.6;">${params.content}</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 16px; text-align: center;">
          تم الإرسال من بوابة نيولاين للتدريب | ${new Date().toLocaleString("ar-SA")}
        </p>
      </div>
    </div>
  `;
  return sendEmail({
    html,
    emailSubject: `اقتراح جديد: ${params.title} - ${params.userName}`,
  });
}
