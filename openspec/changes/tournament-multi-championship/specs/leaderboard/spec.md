## MODIFIED Requirements

### Requirement: Public leaderboard displays ranked player standings
The system SHALL display a ranked standings table **scoped to a specific tournament** at `/campeonatos/:id`, listing players sorted by total accumulated points in descending order. Players with equal points SHALL be sorted by number of wins descending.

#### Scenario: Tournament standings render player rankings
- **WHEN** a visitor opens a tournament detail page
- **THEN** the system displays a ranked table with columns: rank, player name (linked to profile), total points, wins, draws, losses, matches played

#### Scenario: Standings sort by points descending
- **WHEN** two players have different total points within the same tournament
- **THEN** the player with more points appears higher in the ranking

#### Scenario: Tiebreak by wins
- **WHEN** two players have equal total points within the same tournament
- **THEN** the player with more wins appears higher in the ranking

## REMOVED Requirements

### Requirement: Global leaderboard page
**Reason**: Replaced by per-tournament standings. A global cross-tournament ranking mixes events of different sizes and distorts standings.
**Migration**: Use `/campeonatos/:id` to view standings for a specific tournament. Player career totals are visible on individual player profile pages at `/jogadores/:id`.

### Requirement: Leaderboard data refreshes automatically
**Reason**: Auto-polling is unnecessary when data is scoped to a completed or inactive tournament. TanStack Query's default stale-time is sufficient.
**Migration**: No action required; the polling interval (`refetchInterval`) will simply be removed.
