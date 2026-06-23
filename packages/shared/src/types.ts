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
