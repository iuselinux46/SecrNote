const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendReadReceipt(to, timestamp) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to,
      subject: "Your secure note was opened",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0d0d1a;color:#f1f5f9;border-radius:12px;">
          <h2 style="color:#a78bfa;margin-bottom:8px;">Note opened</h2>
          <p style="color:#94a3b8;line-height:1.6;">
            The secure note you shared was opened. The note will be permanently destroyed.
          </p>
          <div style="margin:24px 0;padding:14px 18px;background:#13132a;border:1px solid #2d2d4e;border-radius:8px;font-family:monospace;font-size:13px;color:#a78bfa;">
            Opened at: ${timestamp}
          </div>
          <p style="color:#475569;font-size:12px;">
            This is an automated notification from SecrNote. The note contents were never stored in plaintext on our servers.
          </p>
        </div>
      `,
    });
    console.log(`Read receipt sent to ${to}`);
  } catch (err) {
    console.error("Failed to send read receipt:", err.message);
  }
}

module.exports = { sendReadReceipt };