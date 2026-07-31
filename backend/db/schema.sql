-- Run this once in pgAdmin (Query Tool) to set up the database.
-- Right-click the secrnote database → Query Tool → paste this → Run.

CREATE TABLE IF NOT EXISTS notes (
  id              SERIAL PRIMARY KEY,
  token           UUID NOT NULL UNIQUE,
  encrypted_text  TEXT NOT NULL,
  note_type       VARCHAR(10) NOT NULL DEFAULT 'standard',
  read_seconds    INTEGER DEFAULT NULL,
  expiry          VARCHAR(5) NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  receipt         BOOLEAN NOT NULL DEFAULT FALSE,
  receipt_email   VARCHAR(255) DEFAULT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_token ON notes(token);
CREATE INDEX IF NOT EXISTS idx_notes_expires_at ON notes(expires_at);