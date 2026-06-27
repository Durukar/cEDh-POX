## ADDED Requirements

### Requirement: Public tournament list page
The system SHALL display a public page listing all tournaments ordered by status (active first) then by creation date descending. Each entry shows: name, status badge, match count, and a link to the tournament detail page.

#### Scenario: Visitor sees tournament list
- **WHEN** a visitor navigates to `/campeonatos`
- **THEN** the system displays all tournaments with their name, status (Ativo / Encerrado), and match count

#### Scenario: Active tournaments appear first
- **WHEN** there are both active and finished tournaments
- **THEN** active tournaments appear at the top of the list

#### Scenario: Empty state
- **WHEN** no tournaments exist
- **THEN** the page displays a message indicating no tournaments are available yet

### Requirement: Public tournament detail page with standings
The system SHALL display a public page for a tournament showing: tournament name, status, a ranked standings table (rank, player name, points, wins, draws, losses, matches played), and a list of rounds (match number, date, player count).

#### Scenario: Visitor sees tournament standings
- **WHEN** a visitor navigates to `/campeonatos/:id`
- **THEN** the system displays the tournament's player standings sorted by total points descending, with wins as tiebreaker

#### Scenario: Visitor sees rounds list
- **WHEN** a visitor views a tournament detail page
- **THEN** the system displays a list of all rounds in that tournament ordered by match number, each showing: match number, date played, number of participants

#### Scenario: Tournament not found
- **WHEN** a visitor navigates to a non-existent tournament ID
- **THEN** the system displays a 404 / not found message

#### Scenario: Tournament with no matches
- **WHEN** a tournament has no matches
- **THEN** standings are empty and the rounds list shows an empty state message

### Requirement: Standings link to player profiles
The system SHALL render each player's name in the standings table as a link to their public profile page.

#### Scenario: Player name is clickable
- **WHEN** a visitor clicks a player name in the standings table
- **THEN** the visitor is navigated to `/jogadores/:playerId`
