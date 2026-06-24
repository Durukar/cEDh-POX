export interface Tournament {
  id: number;
  name: string;
  description: string | null;
  status: 'active' | 'finished';
  created_at: string;
  match_count?: number;
}

export interface Player {
  id: number;
  name: string;
  created_at: string;
}

export interface Match {
  id: number;
  match_number: number;
  notes: string | null;
  played_at: string;
  tournament_id: number;
  entries: MatchEntry[];
}

export interface MatchEntry {
  id: number;
  match_id: number;
  player_id: number;
  player_name: string;
  commander_name: string | null;
  status: 'active' | 'disband';
  result: 'win' | 'draw' | 'loss' | 'none';
  points: number;
}

export interface StandingsEntry {
  rank: number;
  player_id: number;
  player_name: string;
  total_points: number;
  wins: number;
  draws: number;
  losses: number;
  matches_played: number;
  commanders: string[];
}

export interface PlayerTournamentHistory {
  tournament_id: number;
  tournament_name: string;
  tournament_status: 'active' | 'finished';
  rank: number;
  total_points: number;
  wins: number;
  draws: number;
  losses: number;
  matches_played: number;
  commanders: string[];
}

export interface PlayerProfile {
  id: number;
  name: string;
  created_at: string;
  career: {
    total_points: number;
    wins: number;
    draws: number;
    losses: number;
    matches_played: number;
    tournaments_played: number;
  };
  tournaments: PlayerTournamentHistory[];
}

export interface GlobalStandingsEntry {
  rank: number;
  player_id: number;
  player_name: string;
  total_points: number;
  wins: number;
  draws: number;
  losses: number;
  matches_played: number;
  tournaments_played: number;
}

/** @deprecated Use StandingsEntry — kept temporarily for LeaderboardTable compat */
export interface LeaderboardEntry {
  rank: number;
  player_id: number;
  player_name: string;
  total_points: number;
  wins: number;
  draws: number;
  losses: number;
  matches_played: number;
  commanders: string[];
}
