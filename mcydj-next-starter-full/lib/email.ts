import { Resend } from "resend";
export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "noreply@mcydj.mx";
  if (!key) throw new Error("Falta RESEND_API_KEY en variables.");
  const resend = new Resend(key);
  const { error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw error;
}
