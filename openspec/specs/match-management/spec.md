## MODIFIED Requirements

### Requirement: Admin can register players for a match
The system SHALL allow an admin to add player entries to a match, specifying for each player: a registered player ID (from the players table), commander name, participation status (active or disband), and result (win/draw/loss/none). The `player_name` free-text field is removed; the endpoint SHALL require `player_id` referencing an existing player record.

#### Scenario: Add active player with result using player_id
- **WHEN** admin adds a player entry using a valid `player_id` with status `active` and result `win`
- **THEN** the entry is saved and the player receives 3 points toward the leaderboard

#### Scenario: Add disbanded player using player_id
- **WHEN** admin adds a player entry using a valid `player_id` with status `disband`
- **THEN** the entry is saved with result `none` and 0 points; the player appears in match history but not in scoring

#### Scenario: Invalid player_id is rejected
- **WHEN** admin submits an entry with a `player_id` that does not exist in the players table
- **THEN** the system returns a 404 error indicating the player was not found

#### Scenario: Multiple players per match
- **WHEN** admin adds multiple players to the same match using different player IDs
- **THEN** all entries are independently tracked under that match

### Requirement: Admin can create a match with a match number
The system SHALL allow an authenticated admin to create a new match record identified by a unique sequential match number **within the context of a specific tournament**. The `tournament_id` is derived from the admin URL context and is required.

#### Scenario: Create match with match number inside tournament
- **WHEN** admin submits a new match form with a match number from within a tournament's management page
- **THEN** the system creates the match associated with that tournament and returns the new match ID

#### Scenario: Duplicate match number within tournament is rejected
- **WHEN** admin attempts to create a match with a match number already in use within the same tournament
- **THEN** the system returns a 409 validation error

#### Scenario: Cannot create match in finished tournament
- **WHEN** admin attempts to create a match for a tournament with status `finished`
- **THEN** the system returns a 409 error

### Requirement: Match list is retrievable by the frontend
The system SHALL expose a public API endpoint that returns all matches **for a specific tournament** with their entries, player names, commanders, statuses, and results.

#### Scenario: Get matches for tournament with entries
- **WHEN** frontend requests the match list for a tournament ID
- **THEN** the API returns all matches for that tournament ordered by match number, each with its player entries

## REMOVED Requirements

### Requirement: Global match list endpoint
**Reason**: Matches are now scoped to tournaments. A global flat list of matches has no defined consumer.
**Migration**: Use `/api/tournaments/:id/matches` instead of `/api/matches`.
