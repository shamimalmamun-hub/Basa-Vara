import express from "express";
import path from "path";
import { Resend } from "resend";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Fallback to .env.example if the API key is not in process.env
if (!process.env.RESEND_API_KEY) {
  dotenv.config({ path: path.join(process.cwd(), '.env.example') });
}

const app = express();
const PORT = 3000;
const SENDER_EMAIL = process.env.VITE_RESEND_FROM || process.env.SENDER_EMAIL || "onboarding@resend.dev";
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "hellothereshamim@gmail.com";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

app.use(express.json());

// Enable CORS for external frontend domain requests when deployed separately
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// API routes
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, html, text, notifyAdmin, from, attachments } = req.body;
    if (!to && !notifyAdmin) {
      return res.status(400).json({ error: "Missing recipient" });
    }
    if (!subject || (!html && !text)) {
      return res.status(400).json({ error: "Missing required template fields" });
    }

    const recipient = notifyAdmin ? ADMIN_NOTIFICATION_EMAIL : (to || ADMIN_NOTIFICATION_EMAIL);
    const resolvedFrom = from || `Basa(vara)-Tutor <${SENDER_EMAIL}>`;

    const resolvedAttachments = attachments && Array.isArray(attachments)
      ? attachments.map((att: any) => ({
          filename: att.filename,
          content: Buffer.from(att.content, 'base64'),
        }))
      : undefined;

    console.log(`[Email Service] Attempting to send email to ${recipient}. Subject: "${subject}". From: "${resolvedFrom}". Attachments check: ${attachments ? attachments.length : 0}`);

    if (!resend) {
      console.warn("[Email Service] Resend API key is not configured. Email payload logged to console instead:");
      console.log({
        from: resolvedFrom,
        to: recipient,
        subject,
        text,
        html: html ? `${html.substring(0, 100)}...` : undefined,
        hasAttachments: !!resolvedAttachments,
      });
      return res.json({ 
          success: true, 
          mocked: true, 
          message: "Email logged to server console because RESEND_API_KEY is not configured.",
          recipient 
      });
    }

    const { data, error } = await resend.emails.send({
      from: resolvedFrom,
      to: recipient,
      subject,
      text: text || "This is a notification from Basa(vara)-Tutor.",
      html: html,
      attachments: resolvedAttachments,
    });

    if (error) {
      console.error("[Email Service] Resend API error response:", error);
      return res.status(400).json({ 
        success: false, 
        error: error.message || "Resend API returned an error", 
        details: error,
        note: SENDER_EMAIL.includes("onboarding@resend.dev") 
          ? "You are using onboarding@resend.dev. Resend only allows sending to your registered account email (hellothereshamim@gmail.com) in sandbox mode. To send to any recipient, verify a domain in Resend and set SENDER_EMAIL in your Env variables."
          : "Verify your RESEND_API_KEY and SENDER_EMAIL config."
      });
    }

    console.log(`[Email Service] Resend API call successful. Email ID: ${data?.id}`);
    res.json({ data, success: true });
  } catch (error: any) {
    console.error("[Email Service] Error sending email:", error);
    res.status(500).json({ error: error?.message || "Failed to send email" });
  }
});

async function start() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error("Failed to start server", err);
});
