## MODIFIED Requirements

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
