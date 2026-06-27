## ADDED Requirements

### Requirement: Admin can create a match with a match number
The system SHALL allow an authenticated admin to create a new match record identified by a unique sequential match number.

#### Scenario: Create match with match number
- **WHEN** admin submits a new match form with a match number
- **THEN** the system creates the match record and returns the new match ID

#### Scenario: Duplicate match number is rejected
- **WHEN** admin attempts to create a match with a match number already in use
- **THEN** the system returns a validation error

### Requirement: Admin can register players for a match
The system SHALL allow an admin to add player entries to a match, specifying for each player: their name, commander name, participation status (active or disband), and result (win/draw/loss).

#### Scenario: Add active player with result
- **WHEN** admin adds a player with status `active` and result `win`
- **THEN** the entry is saved and the player receives 3 points toward the leaderboard

#### Scenario: Add disbanded player
- **WHEN** admin adds a player with status `disband`
- **THEN** the entry is saved with result `none` and 0 points; the player appears in match history but not in scoring

#### Scenario: Multiple players per match
- **WHEN** admin adds multiple players to the same match
- **THEN** all entries are independently tracked under that match

### Requirement: Each match entry records a commander name
The system SHALL allow a commander name to be recorded per player per match entry. Commander names are free-text strings.

#### Scenario: Commander name stored per entry
- **WHEN** admin enters a commander name for a player in a match
- **THEN** that name is persisted and associated with the player's entry for that match

#### Scenario: Commander name is optional
- **WHEN** admin does not provide a commander name
- **THEN** the system saves the entry with a null commander name; the UI displays a placeholder

### Requirement: Admin can update match entries
The system SHALL allow an admin to modify an existing match entry to correct result, commander name, or status.

#### Scenario: Update result for an entry
- **WHEN** admin changes a player's result from `loss` to `win`
- **THEN** the entry is updated and the leaderboard recalculates the player's points

#### Scenario: Update commander name
- **WHEN** admin updates the commander name on an entry
- **THEN** the new commander name is reflected in match history and leaderboard

### Requirement: Admin can delete a match
The system SHALL allow an admin to delete a match and all its associated entries. This removes the match from history and recalculates leaderboard standings.

#### Scenario: Delete match removes all entries
- **WHEN** admin deletes a match
- **THEN** the match and all its player entries are removed from the database

#### Scenario: Leaderboard reflects deletion
- **WHEN** a match is deleted
- **THEN** affected players' point totals are recalculated without the deleted match's contributions

### Requirement: Match list is retrievable by the frontend
The system SHALL expose a public API endpoint that returns all matches with their entries, player names, commanders, statuses, and results.

#### Scenario: Get matches with entries
- **WHEN** frontend requests the match list
- **THEN** the API returns all matches ordered by match number, each with its player entries
