-- Seed local apenas para desenvolvimento
INSERT INTO tournaments (id, name, status) VALUES (1, 'POX — Temporada 1', 'finished');

INSERT INTO players (name) VALUES
  ('Lucas'),
  ('Gabriel'),
  ('Felipe'),
  ('Rodrigo'),
  ('Marina'),
  ('André');

INSERT INTO matches (match_number, notes, tournament_id) VALUES
  (1, 'Rodada 1 - Abertura do torneio', 1),
  (2, 'Rodada 2', 1),
  (3, 'Rodada 3 - Finals', 1);

-- Partida 1 (4 jogadores ativos, 2 disband)
INSERT INTO match_entries (match_id, player_id, commander_name, status, result, points) VALUES
  (1, 1, 'Thrasios & Tymna', 'active', 'win',  3),
  (1, 2, 'Najeela, the Blade-Blossom', 'active', 'loss', 0),
  (1, 3, 'Tivit, Seller of Secrets', 'active', 'loss', 0),
  (1, 4, 'Kinnan, Bonder Prodigy', 'active', 'loss', 0),
  (1, 5, NULL, 'disband', 'none', 0),
  (1, 6, NULL, 'disband', 'none', 0);

-- Partida 2 (empate entre 2, resto perde)
INSERT INTO match_entries (match_id, player_id, commander_name, status, result, points) VALUES
  (2, 2, 'Najeela, the Blade-Blossom', 'active', 'draw', 1),
  (2, 3, 'Tivit, Seller of Secrets',   'active', 'draw', 1),
  (2, 4, 'Kinnan, Bonder Prodigy',      'active', 'loss', 0),
  (2, 5, 'Kraum & Tymna',              'active', 'loss', 0),
  (2, 1, 'Thrasios & Tymna',           'active', 'loss', 0),
  (2, 6, 'Malcolm & Tymna',            'active', 'loss', 0);

-- Partida 3 (Finals)
INSERT INTO match_entries (match_id, player_id, commander_name, status, result, points) VALUES
  (3, 6, 'Malcolm & Tymna',            'active', 'win',  3),
  (3, 1, 'Thrasios & Tymna',           'active', 'loss', 0),
  (3, 2, 'Najeela, the Blade-Blossom', 'active', 'loss', 0),
  (3, 4, 'Kinnan, Bonder Prodigy',     'active', 'loss', 0),
  (3, 3, NULL,                          'disband', 'none', 0),
  (3, 5, NULL,                          'disband', 'none', 0);
