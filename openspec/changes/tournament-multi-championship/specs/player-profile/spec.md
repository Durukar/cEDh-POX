## ADDED Requirements

### Requirement: Public player profile page
The system SHALL display a public profile page for a player at `/jogadores/:id` showing: player name, aggregate career stats (total points, total wins, total matches played, tournaments entered), and a per-tournament history table.

#### Scenario: Visitor views player profile
- **WHEN** a visitor navigates to `/jogadores/:id`
- **THEN** the system displays the player's name, career stats, and tournament history

#### Scenario: Player not found
- **WHEN** a visitor navigates to a player ID that does not exist
- **THEN** the system displays a not-found message

### Requirement: Player profile shows per-tournament history
The system SHALL display a table of all tournaments the player has participated in, showing for each: tournament name (linked to tournament detail), final position in that tournament's standings, total points earned, wins, draws, losses, and matches played.

#### Scenario: Tournament history is ordered by recency
- **WHEN** a player has participated in multiple tournaments
- **THEN** the tournaments are listed from most recent to oldest (by tournament creation date)

#### Scenario: Player with no tournaments
- **WHEN** a player exists but has no match entries in any tournament
- **THEN** the profile shows career stats of zero and an empty tournament history

### Requirement: Player profile shows commanders used per tournament
The system SHALL display, for each tournament in the player's history, the distinct commander names they used across all rounds of that tournament.

#### Scenario: Commanders listed per tournament
- **WHEN** a player used two different commanders across rounds in a tournament
- **THEN** both commander names appear in that tournament's row in the history table

#### Scenario: No commander recorded
- **WHEN** a player has no commander recorded for any entry in a tournament
- **THEN** a placeholder ("—") is shown in the commanders column for that tournament
