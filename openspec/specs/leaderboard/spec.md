## ADDED Requirements

### Requirement: Public leaderboard displays ranked player standings
The system SHALL display a public leaderboard page listing all players sorted by total accumulated points in descending order. Players with equal points SHALL be sorted by number of wins descending, then by number of matches played ascending (fewest matches = higher rank on tiebreak).

#### Scenario: Leaderboard renders player rankings
- **WHEN** a visitor opens the leaderboard page
- **THEN** the system displays a ranked table with columns: rank, player name, total points, wins, draws, losses, matches played

#### Scenario: Leaderboard sorts by points descending
- **WHEN** two players have different total points
- **THEN** the player with more points appears higher in the ranking

#### Scenario: Tiebreak by wins
- **WHEN** two players have equal total points
- **THEN** the player with more wins appears higher in the ranking

### Requirement: Leaderboard shows commander information per match
The system SHALL display each player's most recently used commander name alongside their leaderboard row, or a list of all commanders used across matches.

#### Scenario: Commander name is visible
- **WHEN** a player has at least one match entry with a commander name
- **THEN** the leaderboard row shows the commander name(s) associated with that player

#### Scenario: No commander recorded
- **WHEN** a player has no commander name recorded
- **THEN** the leaderboard row shows a placeholder (e.g., "—")

### Requirement: Leaderboard excludes disbanded players from standings
The system SHALL NOT count points from match entries where the player's status is `disband`. Disbanded entries SHALL still be visible in match history but SHALL NOT contribute to a player's leaderboard score.

#### Scenario: Disbanded entry does not add points
- **WHEN** a player has status `disband` for a match
- **THEN** that match's points (0) are not counted toward their total, and their win/draw/loss counters are not incremented for that match

#### Scenario: Player with only disband entries appears at bottom
- **WHEN** a player has participated in matches but all entries are `disband`
- **THEN** the player appears in the leaderboard with 0 points

### Requirement: Scoring system applies correct point values
The system SHALL calculate points as: Win = 3 points, Draw = 1 point, Loss = 0 points.

#### Scenario: Win awards 3 points
- **WHEN** a match entry has result `win`
- **THEN** 3 points are added to the player's total

#### Scenario: Draw awards 1 point
- **WHEN** a match entry has result `draw`
- **THEN** 1 point is added to the player's total

#### Scenario: Loss awards 0 points
- **WHEN** a match entry has result `loss`
- **THEN** 0 points are added to the player's total

### Requirement: Leaderboard data refreshes automatically
The system SHALL automatically poll the leaderboard API at a reasonable interval (60 seconds) so visitors see updated standings without manual page reload.

#### Scenario: Auto-refresh updates rankings
- **WHEN** 60 seconds have passed since the last fetch
- **THEN** the frontend re-fetches leaderboard data and updates the displayed rankings

### Requirement: Leaderboard displays match count and match number
The system SHALL show the total number of matches a player has participated in (excluding disbanded entries) and the match numbers.

#### Scenario: Match count is accurate
- **WHEN** a player has 3 active (non-disband) match entries
- **THEN** their leaderboard row shows "3" in the matches played column
