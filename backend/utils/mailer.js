require("dotenv").config();

async function sendReadReceipt(to, timestamp) {
  console.log("Sending read receipt to:", to);
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "SecrNote", email: process.env.BREVO_SENDER },
        to: [{ email: to }],
        subject: "Your secure note was opened",
        htmlContent: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0d0d1a;color:#f1f5f9;border-radius:12px;">
            <h2 style="color:#a78bfa;margin-bottom:8px;">Note opened</h2>
            <p style="color:#94a3b8;line-height:1.6;">
              The Secure Note you shared was opened and has been PERMANENTLY destroyed.
            </p>
            <div style="margin:24px 0;padding:14px 18px;background:#13132a;border:1px solid #2d2d4e;border-radius:8px;font-family:monospace;font-size:13px;color:#a78bfa;">
              Opened at: ${timestamp}
            </div>
            <p style="color:#475569;font-size:12px;">
              This is an automated notification from SecrNote.
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Brevo error:", data);
    } else {
      console.log("Email sent, messageId:", data.messageId);
    }
  } catch (err) {
    console.error("Failed to send read receipt:", err.message);
  }
}

module.exports = { sendReadReceipt };