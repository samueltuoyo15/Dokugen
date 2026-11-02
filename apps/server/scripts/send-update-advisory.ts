import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { supabase } from "../supabase";

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || '"Dokugen" <hello@samueltuoyo.com>';

const EMAIL_SUBJECT = "Quick fix for Dokugen update loop";

const EMAIL_TEXT = `Hi there,

If your Dokugen CLI is stuck in an auto-update loop or not updating to the latest version, here is what happened and how to fix it in 30 seconds.

Why this happens:
You likely have Dokugen installed through two different package managers (for example, once via npm and once via pnpm). When an update installs to one package manager, your shell PATH may still point to the older one.

How to fix it:
1. Check which install your system is using:
   which dokugen

2. Remove the duplicate install:
   If you prefer pnpm, remove the npm copy:
   npm uninstall -g dokugen

   If you prefer npm, remove the pnpm copy:
   pnpm remove -g dokugen

3. Install the latest version (14.2.6):
   npm install -g dokugen@latest
   (or: pnpm add -g dokugen@latest)

Dokugen 14.2.6 includes automatic detection for multiple package managers, so future updates will keep your active install in sync.

Thanks for using Dokugen!
Samuel
`;

const EMAIL_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto; padding: 24px; }
    h2 { font-size: 20px; font-weight: 700; margin-top: 24px; margin-bottom: 8px; color: #000; }
    pre { background: #f4f4f5; padding: 12px 16px; border-radius: 8px; font-size: 14px; overflow-x: auto; }
    code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; }
    p { margin: 12px 0; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e4e7; font-size: 14px; color: #71717a; }
  </style>
</head>
<body>
  <p>Hi there,</p>
  <p>If your Dokugen CLI is stuck in an auto-update loop or not updating to the latest version, here is what happened and how to fix it in 30 seconds.</p>

  <h2>Why this happens</h2>
  <p>You likely have Dokugen installed through two different package managers (for example, once via npm and once via pnpm). When an update installs to one package manager, your shell PATH may still point to the older one.</p>

  <h2>How to fix it</h2>
  <p><strong>1. Check which install your system is using:</strong></p>
  <pre><code>which dokugen</code></pre>

  <p><strong>2. Remove the duplicate install:</strong></p>
  <p>If you prefer pnpm, remove the npm copy:</p>
  <pre><code>npm uninstall -g dokugen</code></pre>

  <p>If you prefer npm, remove the pnpm copy:</p>
  <pre><code>pnpm remove -g dokugen</code></pre>

  <p><strong>3. Install the latest version (14.2.6):</strong></p>
  <pre><code>npm install -g dokugen@latest</code></pre>
  <p><em>(or: <code>pnpm add -g dokugen@latest</code>)</em></p>

  <p>Dokugen 14.2.6 includes automatic detection for multiple package managers, so future updates will keep your active install in sync.</p>

  <div class="footer">
    <p>Thanks for using Dokugen!<br><strong>Samuel</strong></p>
  </div>
</body>
</html>`;

async function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "Missing SMTP configuration. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your environment."
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

async function sendAdvisoryEmail(to: string) {
  const transporter = await getTransporter();
  console.log(`Sending advisory email to ${to}...`);

  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject: EMAIL_SUBJECT,
    text: EMAIL_TEXT,
    html: EMAIL_HTML,
  });

  console.log(`Email successfully sent to ${to}: messageId = ${info.messageId}`);
  return info;
}

async function fetchAllUserEmails(): Promise<string[]> {
  const { data, error } = await supabase
    .from("active_users")
    .select("email")
    .not("email", "is", null);

  if (error) {
    throw new Error(`Failed to fetch user emails from Supabase: ${error.message}`);
  }

  const emails = Array.from(
    new Set(
      (data || [])
        .map((row) => row.email?.trim())
        .filter((email): email is string => Boolean(email && email.includes("@")))
    )
  );

  return emails;
}

async function main() {
  const args = process.argv.slice(2);
  const isSendAll = args.includes("--all");
  const toArgIndex = args.indexOf("--to");
  const targetEmail = toArgIndex !== -1 ? args[toArgIndex + 1] : "hello@samueltuoyo.com";

  if (isSendAll) {
    console.log("Fetching all user emails from database...");
    const emails = await fetchAllUserEmails();
    console.log(`Found ${emails.length} unique user emails.`);

    for (const email of emails) {
      try {
        await sendAdvisoryEmail(email);
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (err) {
        console.error(`Error sending to ${email}:`, err);
      }
    }
    console.log("Finished sending advisory emails to all users.");
  } else {
    console.log(`Running in test mode. Target: ${targetEmail}`);
    await sendAdvisoryEmail(targetEmail);
  }
}

main().catch((err) => {
  console.error("Advisory email script error:", err.message);
  process.exit(1);
});
