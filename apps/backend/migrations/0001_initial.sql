CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_number INTEGER NOT NULL UNIQUE,
  notes TEXT,
  played_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS match_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id),
  commander_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'disband')),
  result TEXT NOT NULL DEFAULT 'none' CHECK(result IN ('win', 'draw', 'loss', 'none')),
  points INTEGER NOT NULL DEFAULT 0,
  UNIQUE(match_id, player_id)
);
