# Voting System API Documentation

## Overview

This API manages voting events, candidates, voter accounts and ballots. All successful responses follow a unified envelope:

```
{
  "success": true,
  "data": { /* endpoint-specific payload */ },
  "error": null
}
```

Failed responses look like:

```
{
  "success": false,
  "data": null,
  "error": { "code": "ERROR_CODE", "message": "Human readable message" }
}
```

Codes observed: `BAD_REQUEST`, `REMOTE_ERROR`, `VALIDATION_ERROR`, `INTERNAL_ERROR`, `NOT_FOUND`, `EVENT_OR_PASSWORD_INVALID`, `UNAUTHORIZED`, `ALREADY_VOTED`.

## Base URL

```
http://localhost:8080/api/events
```

All paths below are relative to the base URL.

---

## Standard Payload Fields

Depending on endpoint payloads commonly include:

- `eventId`: Event identifier
- `candidateId`: Candidate identifier (DB generated)
- `userId`, `username`, `password`: Voter account credentials
- `accounts`: Array of account objects (always array in current implementation)
- `candidates`: Array of candidate objects `{ id, name, photo? }` (voter-facing) or normalized objects in client
- `results`: Object mapping candidateId (or name) to vote counts
- `hasVoted`: Boolean vote status

---

## Admin / Management Endpoints

### 1. Create Event

POST `/create`

Request Body:
```json
{ "eventName": "Student Council Election" }
```

Success (200):
```json
{
  "success": true,
  "data": {
    "eventId": "ABC12345",
    "eventName": "Student Council Election",
    "eventPassword": "xyz789"
  },
  "error": null
}
```

Errors: `BAD_REQUEST` if `eventName` missing.

---

### 2. Add Candidate

POST `/{eventId}/candidates` (multipart/form-data)

Form Fields:
- `name` (required)
- `photo` (optional binary)

Success (200):
```json
{
  "success": true,
  "data": {
    "candidateId": "CAND123",
    "eventId": "ABC12345",
    "name": "John Doe",
    "hasPhoto": true
  },
  "error": null
}
```

Errors: `BAD_REQUEST` if name blank, `NOT_FOUND` if event invalid (from underlying service), other remote errors as `REMOTE_ERROR`.

---

### 3. Update Candidate

PUT `/{eventId}/candidates/{candidateId}` (multipart/form-data)

Optional form fields: `name`, `photo` (supply only what you change)

Success (200):
```json
{
  "success": true,
  "data": {
    "candidateId": "CAND123",
    "eventId": "ABC12345",
    "updated": true
  },
  "error": null
}
```

Errors: `NOT_FOUND` if candidate doesn’t exist or nothing changed.

---

### 4. Delete Candidate

DELETE `/{eventId}/candidates/{candidateId}`

Success (200):
```json
{
  "success": true,
  "data": { "candidateId": "CAND123", "eventId": "ABC12345", "deleted": true },
  "error": null
}
```

Errors: `NOT_FOUND` if candidate missing.

---

### 5. Create User Accounts

POST `/{eventId}/accounts`

Body:
```json
{ "eventSize": 3 }
```

Success (200):
```json
{
  "success": true,
  "data": {
    "eventId": "ABC12345",
    "accountsCreated": 3,
    "accounts": [
      { "username": "user001", "userId": "USER001", "password": "PASS123", "eventId": "ABC12345" },
      { "username": "user002", "userId": "USER002", "password": "PASS456", "eventId": "ABC12345" },
      { "username": "user003", "userId": "USER003", "password": "PASS789", "eventId": "ABC12345" }
    ]
  },
  "error": null
}
```

Errors: `BAD_REQUEST` if `eventSize < 1`.

---

### 6. Get User Accounts

GET `/{eventId}/accounts`

Success (200):
```json
{
  "success": true,
  "data": {
    "eventId": "ABC12345",
    "totalAccounts": 3,
    "accounts": [
      { "username": "user001", "userId": "USER001", "password": "PASS123", "eventId": "ABC12345" },
      { "username": "user002", "userId": "USER002", "password": "PASS456", "eventId": "ABC12345" },
      { "username": "user003", "userId": "USER003", "password": "PASS789", "eventId": "ABC12345" }
    ]
  },
  "error": null
}
```

Note: Backend already returns an array (not object map) for `accounts`.

---

## Voting / Voter Endpoints

### 7. Login

POST `/login`

Body:
```json
{ "username": "user001", "password": "PASS123" }
```

Success (200):
```json
{
  "success": true,
  "data": {
    "userId": "USER001",
    "eventId": "ABC12345",
    "eventName": "Student Council Election",
    "eventPassword": "xyz789"
  },
  "error": null
}
```

Errors: `UNAUTHORIZED` invalid credentials.

---

### 8. Get Candidates (Voter)

GET `/{eventId}/candidates?password={eventPassword}`

Success (200):
```json
{
  "success": true,
  "data": {
    "eventId": "ABC12345",
    "totalCandidates": 2,
    "candidates": [
      { "id": "cand001", "name": "Alice", "photo": "data:image/jpeg;base64,..." },
      { "id": "cand002", "name": "Bob" }
    ]
  },
  "error": null
}
```

Errors: `EVENT_OR_PASSWORD_INVALID` (404) if event or password incorrect.

---

### 9. Cast Vote

POST `/{eventId}/vote`

Body:
```json
{ "userId": "USER001", "candidateId": "cand001" }
```

Success (200):
```json
{
  "success": true,
  "data": { "eventId": "ABC12345", "candidateId": "cand001", "userId": "USER001", "success": true },
  "error": null
}
```

Errors: `ALREADY_VOTED` (409) if duplicate vote.

---

### 10. Vote Status

GET `/{eventId}/vote-status/{userId}`

Success (200):
```json
{
  "success": true,
  "data": { "eventId": "ABC12345", "userId": "USER001", "hasVoted": true },
  "error": null
}
```

---

### 11. Get Results

GET `/{eventId}/results`

Success (200):
```json
{
  "success": true,
  "data": {
    "eventId": "ABC12345",
    "totalVotes": 42,
    "results": { "cand001": 20, "cand002": 22 }
  },
  "error": null
}
```

---

## Error Handling Summary

| HTTP | code | Meaning |
|------|------|---------|
| 400 | BAD_REQUEST | Missing/invalid input |
| 401 | UNAUTHORIZED | Login failed |
| 404 | NOT_FOUND | Resource absent |
| 404 | EVENT_OR_PASSWORD_INVALID | Event or password invalid |
| 409 | ALREADY_VOTED | Duplicate ballot |
| 500 | REMOTE_ERROR / INTERNAL_ERROR | Backend or unexpected error |

All errors share structure:
```json
{ "success": false, "data": null, "error": { "code": "...", "message": "..." } }
```

---

## Versioning & CORS

- Current API unversioned under `/api/events`.
- CORS allowed origins configured via `app.cors.allowed-origins` property.

---

## Future Improvements (Suggested)

- Add pagination to accounts & candidates.
- Provide HEAD / health endpoint.
- Add rate limiting headers.
- Include ETag/Last-Modified for candidates & results.

---

## Changelog

- 2025-09-02: Documentation synchronized with backend controller implementation (`VotingController`).


---

## Admin Endpoints

### 1. Create Event

Creates a new voting event.

**Endpoint:** `POST /create`

**Request Body:**

```json
{
  "eventName": "Student Council Election 2024"
}
```

**Response:**

```json
{
  "eventId": "ABC12345",
  "eventName": "Student Council Election 2024",
  "eventPassword": "xyz789"
}
```

---

### 2. Add Candidate

Adds a candidate to an existing event with photo upload.

**Endpoint:** `POST /{eventId}/candidates`

**Parameters:**

- `eventId` (path) - The event ID
- `name` (form-data) - Candidate name
- `photo` (form-data) - Candidate photo file

**Response:**

```json
{
  "message": "Candidate 'John Doe' added successfully to event ABC12345",
  "candidateName": "John Doe",
  "eventId": "ABC12345"
}
```

---

### 3. Create User Accounts

Creates multiple user accounts for an event and returns all account details.

**Endpoint:** `POST /{eventId}/accounts`

**Request Body:**

```json
{
  "eventSize": 3
}
```

**Response:**

```json
{
  "message": "Successfully created 3 user accounts for event ABC12345",
  "eventId": "ABC12345",
  "accountsCreated": 3,
  "accounts": [
    {
      "username": "user001",
      "userId": "USER001",
      "password": "PASS123",
      "eventId": "ABC12345"
    },
    {
      "username": "user002",
      "userId": "USER002",
      "password": "PASS456",
      "eventId": "ABC12345"
    },
    {
      "username": "user003",
      "userId": "USER003",
      "password": "PASS789",
      "eventId": "ABC12345"
    }
  ]
}
```

---

### 4. Get User Accounts

Retrieves all user accounts for an event.

**Endpoint:** `GET /{eventId}/accounts`

**Response:**

```json
{
  "message": "Retrieved user accounts for event ABC12345",
  "eventId": "ABC12345",
  "totalAccounts": 3,
  "accounts": {
    "0": "ID: USER001 | Password: PASS123",
    "1": "ID: USER002 | Password: PASS456",
    "2": "ID: USER003 | Password: PASS789"
  }
}
```

---

### 5. Get Results

Retrieves voting results for an event.

**Endpoint:** `GET /{eventId}/results`

**Response:**

```json
{
  "message": "Retrieved voting results for event ABC12345",
  "eventId": "ABC12345",
  "totalVotes": 50,
  "results": {
    "John Doe": 25,
    "Jane Smith": 18,
    "Bob Johnson": 7
  }
}
```

---

## Voter Endpoints

### 6. User Login

Authenticates a user with username and password.

**Endpoint:** `POST /login`

**Request Body:**

```json
{
  "username": "user001",
  "password": "PASS123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "username": "user001",
  "status": "authenticated"
}
```

---

### 7. Get Candidates for Voting

Retrieves candidates for a specific event (requires event password).

**Endpoint:** `GET /{eventId}/candidates`

**Parameters:**

- `eventId` (path) - The event ID
- `password` (query) - Event password

**Response:**

```json
{
  "message": "Retrieved candidates for event ABC12345",
  "eventId": "ABC12345",
  "totalCandidates": 2,
  "candidates": [
    {
      "id": "candidate_001",
      "name": "John Doe",
      "photo": null
    },
    {
      "id": "candidate_002",
      "name": "Jane Smith",
      "photo": null
    }
  ]
}
```

---

### 8. Cast Vote

Casts a vote for a specific candidate in an event.

**Endpoint:** `POST /{eventId}/vote`

**Request Body:**

```json
{
  "candidateId": "candidate_001"
}
```

**Response:**

```json
{
  "message": "Vote cast successfully",
  "eventId": "ABC12345",
  "candidateId": "candidate_001"
}
```

---

## Complete Workflow Examples

### Admin Workflow

```bash
# 1. Create an event
curl -X POST http://localhost:8080/api/events/create \
  -H "Content-Type: application/json" \
  -d '{"eventName": "Student Council Election"}'

# Response: {"eventId": "ABC12345", "eventName": "Student Council Election", "eventPassword": "xyz789"}

# 2. Add candidates
curl -X POST http://localhost:8080/api/events/ABC12345/candidates \
  -F "name=John Doe" \
  -F "photo=@john.jpg"

# Response: {"message": "Candidate 'John Doe' added successfully to event ABC12345", "candidateName": "John Doe", "eventId": "ABC12345"}

# 3. Create user accounts
curl -X POST http://localhost:8080/api/events/ABC12345/accounts \
  -H "Content-Type: application/json" \
  -d '{"eventSize": 3}'

# Response: Full account details with usernames, IDs, and passwords

# 4. Get user accounts
curl http://localhost:8080/api/events/ABC12345/accounts

# Response: Formatted account list for distribution
```

### Voter Workflow

```bash
# 1. Login
curl -X POST http://localhost:8080/api/events/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user001", "password": "PASS123"}'

# Response: {"message": "Login successful", "username": "user001", "status": "authenticated"}

# 2. Get candidates
curl "http://localhost:8080/api/events/ABC12345/candidates?password=xyz789"

# Response: {"message": "Retrieved candidates for event ABC12345", "eventId": "ABC12345", "totalCandidates": 2, "candidates": [...]}

# 3. Cast vote
curl -X POST http://localhost:8080/api/events/ABC12345/vote \
  -H "Content-Type: application/json" \
  -d '{"candidateId": "candidate_001"}'

# Response: {"message": "Vote cast successfully", "eventId": "ABC12345", "candidateId": "candidate_001"}

# 4. Check results
curl http://localhost:8080/api/events/ABC12345/results

# Response: {"message": "Retrieved voting results for event ABC12345", "eventId": "ABC12345", "totalVotes": 50, "results": {...}}
```

---

## Key Improvements

### ✅ **Consistent JSON Responses**

- All endpoints now return structured JSON responses
- Consistent message format across all endpoints
- Proper HTTP status codes and error handling

### ✅ **Enhanced Account Creation**

- `createAccounts()` now returns complete account details
- Includes username, userId, password, and eventId for each account
- Easy integration for frontend applications

### ✅ **Better Data Structure**

- Responses include metadata (totalVotes, totalCandidates, etc.)
- Clear separation between message and data
- Standardized field naming conventions

### ✅ **Improved Developer Experience**

- Predictable response format for all endpoints
- Rich metadata for better UI integration
- Complete account information for easy distribution

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "timestamp": "2024-01-15T10:30:00.000+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Failed to create event in database",
  "path": "/api/events/create"
}
```

---

## Testing

All endpoints can be tested with the provided cURL commands. The API now provides comprehensive JSON responses that are perfect for frontend integration and debugging.

---

## New Voting System Features (Updated)

### 9. Check Vote Status

Checks if a user has already voted in a specific event.

**Endpoint:** `GET /{eventId}/vote-status/{userId}`

**Parameters:**

- `eventId` (path) - The event ID
- `userId` (path) - The user ID

**Response:**

```json
{
  "message": "Vote status retrieved for user USER001 in event ABC12345",
  "eventId": "ABC12345",
  "userId": "USER001",
  "hasVoted": false
}
```

**Example:**

```bash
curl http://localhost:8080/api/events/ABC12345/vote-status/USER001
```

---

## Updated Cast Vote Endpoint

### Cast Vote (Updated)

Casts a vote for a specific candidate in an event. Each user can only vote once per event.

**Endpoint:** `POST /{eventId}/vote`

**Request Body:**

```json
{
  "userId": "USER001",
  "candidateId": "1"
}
```

**Response (Success):**

```json
{
  "message": "Vote cast successfully",
  "success": true,
  "eventId": "ABC12345",
  "candidateId": "1",
  "userId": "USER001"
}
```

**Response (Already Voted):**

```json
{
  "message": "Vote failed - User may have already voted or invalid data",
  "success": false,
  "eventId": "ABC12345",
  "candidateId": "1",
  "userId": "USER001"
}
```

**Response (Missing Fields):**

```json
{
  "message": "Missing required fields: userId and candidateId",
  "success": false,
  "eventId": "ABC12345"
}
```

**Example:**

```bash
curl -X POST http://localhost:8080/api/events/ABC12345/vote \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER001", "candidateId": "1"}'
```

---

## Voting System Improvements

### ✅ **One Vote Per User**

- Each user can only vote once per event
- Duplicate votes are automatically prevented
- Vote status can be checked before attempting to vote

### ✅ **Proper Vote Counting**

- Votes are stored in dedicated `votes` table
- Vote counts are calculated dynamically from actual votes
- No more manual vote counter updates

### ✅ **Enhanced Security**

- Foreign key constraints ensure data integrity
- User validation before vote casting
- Proper error handling and logging

### ✅ **Better API Responses**

- Success/failure status in responses
- Detailed error messages
- Comprehensive vote status information

### ✅ **Database Integrity**

- Votes table with proper relationships
- Automatic timestamp tracking
- Consistent data structure

---

## Updated Workflow Examples

### Complete Voter Workflow (Updated)

```bash
# 1. Login
curl -X POST http://localhost:8080/api/events/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user001", "password": "PASS123"}'

# 2. Check if already voted
curl http://localhost:8080/api/events/ABC12345/vote-status/USER001

# 3. Get candidates
curl "http://localhost:8080/api/events/ABC12345/candidates?password=xyz789"

# 4. Cast vote (only if not already voted)
curl -X POST http://localhost:8080/api/events/ABC12345/vote \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER001", "candidateId": "1"}'

# 5. Check results
curl http://localhost:8080/api/events/ABC12345/results
```

---

## Database Schema Updates

### Votes Table Structure

```sql
CREATE TABLE votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    candidate_id INT NOT NULL,
    event_id VARCHAR(50) NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (candidate_id) REFERENCES candidates(id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    UNIQUE KEY unique_user_event (user_id, event_id)
);
```

### Vote Counting Query

```sql
SELECT c.id, c.name, COUNT(v.candidate_id) as votes
FROM candidates c
LEFT JOIN votes v ON c.id = v.candidate_id AND v.event_id = ?
WHERE c.event_id = ?
GROUP BY c.id, c.name
```

This ensures accurate vote counting from the actual votes cast, not from a manually maintained counter.
