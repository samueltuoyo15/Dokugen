import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { supabase } from "../supabase";

dotenv.config();

const SENDLIBERTY_API_KEY = process.env.SENDLIBERTY_API_KEY;
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

async function sendEmailViaSendLiberty(to: string, retries = 2): Promise<Record<string, unknown>> {
  if (!SENDLIBERTY_API_KEY) {
    throw new Error("Missing SENDLIBERTY_API_KEY in environment.");
  }

  console.log(`Sending advisory email to ${to} via SendLiberty...`);

  const response = await fetch("https://sendliberty.com/api/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDLIBERTY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      subject: EMAIL_SUBJECT,
      text: EMAIL_TEXT,
      html: EMAIL_HTML,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (response.status === 429 && retries > 0) {
    console.warn(`Rate limit hit (429). Pausing 3 seconds before retrying ${to}...`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return sendEmailViaSendLiberty(to, retries - 1);
  }

  if (!response.ok) {
    throw new Error(`SendLiberty API error (${response.status}): ${JSON.stringify(data)}`);
  }

  console.log(`Email successfully sent to ${to}:`, data);
  return data;
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
        .filter((email): email is string => {
          if (!email || !email.includes("@")) return false;
          const lower = email.toLowerCase();
          if (lower.includes("noreply") || lower.includes("github.com")) return false;
          return true;
        })
    )
  );

  return emails;
}

const ALREADY_SENT_FILE = path.resolve(__dirname, "already_sent.json");

function loadSentEmails(): Set<string> {
  if (fs.existsSync(ALREADY_SENT_FILE)) {
    try {
      const content = fs.readFileSync(ALREADY_SENT_FILE, "utf8");
      const list = JSON.parse(content) as string[];
      return new Set(list.map((e) => e.toLowerCase()));
    } catch {
      return new Set();
    }
  }
  return new Set();
}

function recordSentEmail(email: string, sentSet: Set<string>) {
  sentSet.add(email.toLowerCase());
  try {
    fs.writeFileSync(ALREADY_SENT_FILE, JSON.stringify(Array.from(sentSet), null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to already_sent.json:", err);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isSendAll = args.includes("--all");
  const toArgIndex = args.indexOf("--to");
  const targetEmail = toArgIndex !== -1 ? args[toArgIndex + 1] : "hello@samueltuoyo.com";

  if (isSendAll) {
    const sentSet = loadSentEmails();
    console.log(`Loaded ${sentSet.size} already sent emails.`);
    console.log("Fetching eligible user emails from database...");
    const allEmails = await fetchAllUserEmails();
    const pendingEmails = allEmails.filter((e) => !sentSet.has(e.toLowerCase()));

    console.log(`Total eligible users: ${allEmails.length}. Already sent: ${sentSet.size}. Pending to send: ${pendingEmails.length}`);

    for (let i = 0; i < pendingEmails.length; i++) {
      const email = pendingEmails[i];
      try {
        console.log(`[${i + 1}/${pendingEmails.length}] Sending to ${email}...`);
        await sendEmailViaSendLiberty(email);
        recordSentEmail(email, sentSet);
      } catch (err) {
        const error = err as Error;
        console.error(`Error sending to ${email}:`, error.message);
      }
      // Respect SendLiberty 30 req/min rate limit (1 email per 2.2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2200));
    }
    console.log("Finished sending advisory emails to all remaining users.");
  } else {
    console.log(`Running in test mode. Target: ${targetEmail}`);
    await sendEmailViaSendLiberty(targetEmail);
  }
}

main().catch((err) => {
  const error = err as Error;
  console.error("Advisory email script error:", error.message);
  process.exit(1);
});
