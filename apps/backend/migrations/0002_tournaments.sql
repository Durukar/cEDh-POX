CREATE TABLE IF NOT EXISTS tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'finished')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default tournament before altering matches (so DEFAULT 1 is a valid row)
INSERT INTO tournaments (id, name, status) VALUES (1, 'POX — Temporada 1', 'finished');

-- SQLite does not allow ADD COLUMN with REFERENCES + DEFAULT; omit FK constraint here
ALTER TABLE matches ADD COLUMN tournament_id INTEGER DEFAULT 1;

-- Ensure all existing rows are associated with the default tournament
UPDATE matches SET tournament_id = 1 WHERE tournament_id IS NULL;
