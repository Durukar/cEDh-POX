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
