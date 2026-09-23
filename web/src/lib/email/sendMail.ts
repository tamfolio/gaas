import transporter from "./transporter";

export const FROM_NAME = "EngineRoom";
export const FROM_EMAIL = process.env.SENDER_MAIL ?? "";

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  return transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
  });
}
