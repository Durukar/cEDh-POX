## ADDED Requirements

### Requirement: Admin area is accessible via a dedicated route
The system SHALL provide a dedicated `/admin` route in the frontend SPA that renders the admin dashboard. The route SHALL be visually distinct from the public leaderboard.

#### Scenario: Navigate to admin area
- **WHEN** a user navigates to `/admin`
- **THEN** the admin dashboard UI is rendered

#### Scenario: Admin route is separate from public leaderboard
- **WHEN** a visitor is on the leaderboard page
- **THEN** there is no prominent link to the admin area (admin access is via direct URL)

### Requirement: Admin area requires a secret token to operate
The system SHALL require a secret token before admin API calls succeed. The frontend SHALL prompt for the token on first visit and persist it in `localStorage`. All admin API requests SHALL include the token as a request header (`X-Admin-Token`).

#### Scenario: Token prompt on first admin visit
- **WHEN** admin navigates to `/admin` with no token stored
- **THEN** the UI shows a token entry prompt before rendering the dashboard

#### Scenario: Valid token allows admin operations
- **WHEN** admin enters the correct token and submits a form
- **THEN** the API accepts the request and returns a success response

#### Scenario: Invalid token is rejected
- **WHEN** admin submits a request with an incorrect token
- **THEN** the API returns 401 Unauthorized and the UI shows an error message

#### Scenario: Token persists across page reloads
- **WHEN** admin reloads the page after entering a valid token
- **THEN** the stored token is used automatically without re-prompting

### Requirement: Admin dashboard shows match list with management actions
The system SHALL render a list of all existing matches in the admin area, each with options to view entries, add players, edit entries, and delete the match.

#### Scenario: Match list visible in admin
- **WHEN** admin loads the dashboard
- **THEN** all matches are listed with their match numbers and entry counts

#### Scenario: Add player entry to a match
- **WHEN** admin selects a match and submits the add-player form
- **THEN** a new entry is created and the match entry list updates

#### Scenario: Edit player entry
- **WHEN** admin edits an existing entry and saves
- **THEN** the entry is updated and the UI reflects the change

#### Scenario: Delete match with confirmation
- **WHEN** admin clicks delete on a match and confirms
- **THEN** the match is deleted and removed from the list

### Requirement: Admin can create new matches from the dashboard
The system SHALL provide a form in the admin area to create a new match by entering a match number and optional notes.

#### Scenario: Create match form submission
- **WHEN** admin fills in the match number and submits the create-match form
- **THEN** a new match is created and appears in the match list

### Requirement: Backend validates admin token on all protected routes
The system SHALL reject any request to `/api/admin/*` that does not include a valid `X-Admin-Token` header matching the configured `ADMIN_TOKEN` Worker secret.

#### Scenario: Missing token returns 401
- **WHEN** a request to `/api/admin/*` is made without the `X-Admin-Token` header
- **THEN** the Worker returns HTTP 401 with an error message

#### Scenario: Wrong token returns 401
- **WHEN** a request includes an incorrect token value
- **THEN** the Worker returns HTTP 401
