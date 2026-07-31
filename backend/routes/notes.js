const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const pool = require("../db/connection");
const { sendReadReceipt } = require("../utils/mailer");

function getExpiresAt(expiry) {
  const now = new Date();
  switch (expiry) {
    case "1h":  return new Date(now.getTime() + 1 * 60 * 60 * 1000);
    case "24h": return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "7d":  return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default:    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

// POST /api/notes — create a note
router.post("/", async (req, res) => {
  const { encrypted_text, note_type, read_seconds, expiry, receipt, receipt_email } = req.body;

  if (!encrypted_text || !expiry) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  if (note_type === "timed" && (!read_seconds || read_seconds < 1)) {
    return res.status(400).json({ error: "Timed notes require read_seconds." });
  }
  if (receipt && !receipt_email) {
    return res.status(400).json({ error: "Receipt email is required when receipt is enabled." });
  }

  try {
    const token = uuidv4();
    const expires_at = getExpiresAt(expiry);

    await pool.query(
      `INSERT INTO notes
        (token, encrypted_text, note_type, read_seconds, expiry, expires_at, receipt, receipt_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        token,
        encrypted_text,
        note_type || "standard",
        note_type === "timed" ? read_seconds : null,
        expiry,
        expires_at,
        receipt || false,
        receipt ? receipt_email : null,
      ]
    );

    res.status(201).json({
      token,
      link: `${process.env.FRONTEND_URL}/view.html?token=${token}`,
      expires_at,
    });
  } catch (err) {
    console.error("POST /api/notes error:", err.message);
    res.status(500).json({ error: "Failed to create note." });
  }
});

// GET /api/notes/:token — fetch and destroy a note
router.get("/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM notes WHERE token = $1",
      [token]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found or already destroyed." });
    }

    const note = result.rows[0];

    if (new Date() > new Date(note.expires_at)) {
      await pool.query("DELETE FROM notes WHERE token = $1", [token]);
      return res.status(410).json({ error: "This note has expired." });
    }

    await pool.query("DELETE FROM notes WHERE token = $1", [token]);

    if (note.receipt && note.receipt_email) {
      const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
      sendReadReceipt(note.receipt_email, timestamp);
    }

    res.status(200).json({
      encrypted_text: note.encrypted_text,
      note_type: note.note_type,
      read_seconds: note.read_seconds,
    });
  } catch (err) {
    console.error("GET /api/notes/:token error:", err.message);
    res.status(500).json({ error: "Failed to retrieve note." });
  }
});

module.exports = router;