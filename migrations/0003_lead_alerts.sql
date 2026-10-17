CREATE TABLE IF NOT EXISTS lead_alerts (
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK(channel IN ('email','whatsapp')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','accepted','failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL DEFAULT 0,
  lease_until INTEGER NOT NULL DEFAULT 0,
  provider_id TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  accepted_at TEXT,
  PRIMARY KEY (lead_id, channel)
);
CREATE INDEX IF NOT EXISTS lead_alerts_due ON lead_alerts(status, next_attempt_at);
