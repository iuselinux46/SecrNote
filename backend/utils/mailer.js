const nodemailer = require("nodemailer");
const dns = require("dns");
require("dotenv").config();

// Force Node.js to prefer IPv4 globally
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendReadReceipt(to, timestamp) {
  console.log("Sending read receipt to:", to);
  try {
    const result = await transporter.sendMail({
      from: `"SecrNote" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Your secure note was opened",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0d0d1a;color:#f1f5f9;border-radius:12px;">
          <h2 style="color:#a78bfa;margin-bottom:8px;">Note opened</h2>
          <p style="color:#94a3b8;line-height:1.6;">
            The secure note you shared was opened and has been permanently destroyed.
          </p>
          <div style="margin:24px 0;padding:14px 18px;background:#13132a;border:1px solid #2d2d4e;border-radius:8px;font-family:monospace;font-size:13px;color:#a78bfa;">
            Opened at: ${timestamp}
          </div>
          <p style="color:#475569;font-size:12px;">
            This is an automated notification from SecrNote.
          </p>
        </div>
      `,
    });
    console.log("Email sent:", result.messageId);
  } catch (err) {
    console.error("Failed to send read receipt:", err.message);
  }
}

module.exports = { sendReadReceipt };