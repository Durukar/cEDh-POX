## ADDED Requirements

### Requirement: Admin can create a tournament
The system SHALL allow an authenticated admin to create a named tournament with an optional description and a status of `active` or `finished`.

#### Scenario: Create tournament with name
- **WHEN** admin submits a tournament creation form with a name
- **THEN** the system creates the tournament with status `active` and returns the new tournament record

#### Scenario: Tournament name is required
- **WHEN** admin attempts to create a tournament without a name
- **THEN** the system returns a 400 validation error

#### Scenario: Duplicate tournament name is rejected
- **WHEN** admin attempts to create a tournament with a name already in use
- **THEN** the system returns a 409 conflict error

### Requirement: Admin can edit a tournament
The system SHALL allow an authenticated admin to rename a tournament and change its status between `active` and `finished`.

#### Scenario: Rename tournament
- **WHEN** admin submits an updated name for an existing tournament
- **THEN** the tournament record is updated and the new name is reflected everywhere it appears

#### Scenario: Mark tournament as finished
- **WHEN** admin sets a tournament's status to `finished`
- **THEN** the tournament becomes read-only: no new matches can be added to it via the admin

#### Scenario: Reopen finished tournament
- **WHEN** admin sets a tournament's status back to `active`
- **THEN** new matches can be added to it again

### Requirement: Admin can delete a tournament
The system SHALL allow an authenticated admin to delete a tournament only if it has no associated matches.

#### Scenario: Delete empty tournament
- **WHEN** admin deletes a tournament with zero matches
- **THEN** the tournament record is removed

#### Scenario: Delete tournament with matches is rejected
- **WHEN** admin attempts to delete a tournament that has one or more matches
- **THEN** the system returns a 409 error indicating the number of matches that would be orphaned

### Requirement: Tournament list is available in the admin
The system SHALL display a list of all tournaments in the admin panel, showing name, status, match count, and creation date.

#### Scenario: Admin sees all tournaments
- **WHEN** admin navigates to the tournaments section
- **THEN** the system displays all tournaments ordered by creation date descending

### Requirement: Matches are scoped to a tournament in the admin
The system SHALL require a `tournament_id` when creating a match. Admin match management operates within the context of a selected tournament.

#### Scenario: Create match within tournament
- **WHEN** admin creates a match from within a tournament's management page
- **THEN** the match is associated with that tournament's ID

#### Scenario: Cannot add match to finished tournament
- **WHEN** admin attempts to create a match for a tournament with status `finished`
- **THEN** the system returns a 409 error
