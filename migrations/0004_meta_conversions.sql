-- Separate from owner notifications: only new saved leads are queued for Meta.
CREATE TABLE IF NOT EXISTS meta_conversions (
  lead_id TEXT PRIMARY KEY REFERENCES leads(id) ON DELETE CASCADE,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','accepted','failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL DEFAULT 0,
  lease_until INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  accepted_at TEXT
);
CREATE INDEX IF NOT EXISTS meta_conversions_due ON meta_conversions(status,next_attempt_at);
