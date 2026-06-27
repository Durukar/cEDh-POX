## ADDED Requirements

### Requirement: Admin can view who played in a match
The system SHALL display in the match detail view the full list of players who participated in that match, including each player's name, commander, status (active/disband), result, and points.

#### Scenario: Match detail shows all participants
- **WHEN** admin opens the detail view for a match
- **THEN** the UI lists every player entry for that match with name, commander, status, result, and points

#### Scenario: Match with no entries shows empty state
- **WHEN** admin opens a match that has no player entries yet
- **THEN** the UI shows an empty state prompt to add participants

### Requirement: Admin can add a registered player to a match using a player lookup
The system SHALL allow an admin to add a player to a match by selecting from the list of registered players (by `player_id`), rather than entering a free-text name. The admin SHALL also specify commander name, status, and result.

#### Scenario: Add player via dropdown
- **WHEN** admin selects a registered player from the dropdown and fills in commander, status, and result, then submits
- **THEN** the entry is created and the player appears in the match's participant list

#### Scenario: Duplicate player in same match is rejected
- **WHEN** admin attempts to add a player who is already registered in that match
- **THEN** the system returns a 409 Conflict error and the UI shows an appropriate message

#### Scenario: Only registered players can be added
- **WHEN** admin opens the "add participant" form for a match
- **THEN** the player selection is a dropdown populated exclusively from the registered player list — no free-text entry allowed

### Requirement: Admin can remove a player from a match
The system SHALL allow an admin to remove a player's entry from a match. Removing an entry recalculates affected point totals on the leaderboard.

#### Scenario: Remove player entry from match
- **WHEN** admin clicks remove on a player entry in the match detail view
- **THEN** the entry is deleted and the player no longer appears in that match's roster

#### Scenario: Leaderboard reflects entry removal
- **WHEN** an entry is removed from a match
- **THEN** the player's cumulative points are recalculated without that entry's contribution

### Requirement: Weekly roster provides the foundation for individual player statistics
The system SHALL persist sufficient data per match entry (player_id, commander, result, points, played_at) so that future queries can aggregate per-player statistics such as: total matches played, total wins, total points, commanders used.

#### Scenario: Data is structured for per-player aggregation
- **WHEN** multiple matches have been recorded with player entries
- **THEN** querying `match_entries` filtered by `player_id` returns a complete history of that player's participation, commanders, and results
