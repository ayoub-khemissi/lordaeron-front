import nodemailer from "nodemailer";

/*
 * The site's e-mails, through Brevo's relay (SMTP_* in .env.local). They come from SMTP_FROM, "Lordaeron <noreply@lordaeron.eu>"
 * (Ayoub, 13/10/2026: no mailbox behind it, the e-mails send questions to Discord; the domain is authenticated with SPF, DKIM and
 * DMARC). Every e-mail has an HTML part and its plain-text twin (lib/email-templates/layout.ts); news e-mails add the one-click
 * unsubscribe headers.
 */

const FROM = process.env.SMTP_FROM || "Lordaeron <noreply@lordaeron.eu>";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASSWORD || "",
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  text,
  unsubscribeUrl,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  // news e-mails only: RFC 8058 one-click unsubscribe (Gmail and Yahoo require it for bulk senders)
  unsubscribeUrl?: string;
}) {
  await transport.sendMail({
    from: FROM,
    to,
    subject,
    html,
    text,
    headers: unsubscribeUrl
      ? {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        }
      : undefined,
  });
}
