## ADDED Requirements

### Requirement: Admin can create a player
The system SHALL allow an authenticated admin to create a new player with a unique name. The name SHALL be a non-empty string. The system SHALL reject duplicate names (case-insensitive comparison not required — exact match).

#### Scenario: Successful player creation
- **WHEN** admin submits a player name that does not already exist
- **THEN** the system creates the player and returns the new record with `id`, `name`, and `created_at`

#### Scenario: Duplicate name is rejected
- **WHEN** admin submits a player name that already exists
- **THEN** the system returns a 409 Conflict error

#### Scenario: Empty name is rejected
- **WHEN** admin submits an empty or whitespace-only name
- **THEN** the system returns a 400 Bad Request error

### Requirement: Admin can list all players
The system SHALL expose an admin endpoint that returns all players ordered by name ascending. The response SHALL include each player's `id`, `name`, and `created_at`.

#### Scenario: List players returns all records
- **WHEN** admin requests the player list
- **THEN** the system returns all players sorted by name

#### Scenario: Empty list when no players exist
- **WHEN** no players have been created
- **THEN** the system returns an empty array

### Requirement: Admin can update a player's name
The system SHALL allow an authenticated admin to rename a player. The new name SHALL be unique and non-empty.

#### Scenario: Successful rename
- **WHEN** admin submits a new name that does not conflict with an existing player
- **THEN** the player's name is updated and the response reflects the new name

#### Scenario: Rename to duplicate name is rejected
- **WHEN** admin submits a new name already taken by another player
- **THEN** the system returns a 409 Conflict error

#### Scenario: Rename non-existent player
- **WHEN** admin attempts to rename a player ID that does not exist
- **THEN** the system returns a 404 Not Found error

### Requirement: Admin can delete a player
The system SHALL allow an authenticated admin to delete a player who has no associated match entries. If the player has match entries, the delete SHALL be rejected.

#### Scenario: Successful delete of player with no entries
- **WHEN** admin deletes a player who has never participated in any match
- **THEN** the player record is removed and the system returns a success response

#### Scenario: Delete blocked when player has entries
- **WHEN** admin attempts to delete a player who has one or more match entries
- **THEN** the system returns a 409 Conflict error indicating how many entries exist

#### Scenario: Delete non-existent player
- **WHEN** admin attempts to delete a player ID that does not exist
- **THEN** the system returns a 404 Not Found error

### Requirement: Player management UI is accessible in the admin area
The system SHALL provide a dedicated "Participantes" section in the admin UI where the admin can view, add, rename, and delete players from a table interface.

#### Scenario: Admin navigates to player list
- **WHEN** admin opens the "Participantes" tab or section in the admin area
- **THEN** the UI displays a table with all current players and action buttons for edit and delete

#### Scenario: Admin adds a player via form
- **WHEN** admin fills in the player name field and submits the create form
- **THEN** the new player appears in the table immediately

#### Scenario: Admin renames a player inline
- **WHEN** admin clicks the edit action for a player, changes the name, and confirms
- **THEN** the updated name is reflected in the table

#### Scenario: Admin attempts to delete a player with entries
- **WHEN** admin clicks delete for a player who has match entries
- **THEN** the UI shows an error message explaining the player cannot be deleted while entries exist
