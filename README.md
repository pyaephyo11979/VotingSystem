# University of Computer Studies Pathein – Voting System

A modular voting platform composed of an RMI microservice (business logic + database access), a Spring Boot API layer, and an optional Vite/React frontend. This document walks through the exact manual steps to run the backend stack (no Docker required).

## Module Overview

| Layer | Folder | Description |
| --- | --- | --- |
| Shared contracts | [shared](shared) | `VotingService`, `EventInfo`, and other DTOs consumed by both JVM services |
| RMI microservice | [rmi-server](rmi-server) | Core voting logic, AES password encryption, direct MySQL access |
| REST bridge | [api-bridge](api-bridge) | Spring Boot 3 API exposing REST endpoints to browsers and the frontend |
| React client (optional) | [react-frontend](react-frontend) | Admin dashboard, voter UI, live results | 

## Prerequisites

- Java 17+ (to run Spring Boot) and Java 15+ (to compile the standalone RMI module)
- Maven 3.9+
- Node.js 20+ (only if you plan to run the React frontend)
- MySQL 8.x reachable at `localhost:3306`

## End-to-End Setup (Manual)

### 1. Clone the repo and install shared contracts
```bash
git clone https://github.com/pyaephyo11979/VotingSystem.git
cd VotingSystem
mvn -pl shared clean install   # publishes org.example:shared to ~/.m2
```

### 2. Prepare the MySQL schema
1. Create a schema named `votingdb` and grant a user (`root`/`root` by default in code) full access.
2. Seed the tables:
  ```bash
  mysql -h localhost -u root -p votingdb < rmi-server/src/main/resources/init-database.sql
  ```
  The same structure exists in [rmi-server/src/main/java/SchemaCreator.java](rmi-server/src/main/java/SchemaCreator.java) if you prefer a Java-based creator.

### 3. Configure the RMI microservice
1. Open [rmi-server/src/main/java/DBController.java](rmi-server/src/main/java/DBController.java).
2. Update the `url`, `username`, `password`, and `SECRET` constants so they match your MySQL instance and 32-char AES secret.
3. (Optional) Adjust the registry host exposing RMI by exporting `RMI_HOST` before launch. The default host is `0.0.0.0` and the registry port is `1099` (see [rmi-server/src/main/java/Server.java](rmi-server/src/main/java/Server.java)).

### 4. Run the RMI microservice
```bash
cd rmi-server
mvn compile exec:java -Dexec.mainClass=Server
```
You should see `✅ RMI Server is running...` in the console along with future log lines from [VotingServiceImpl](rmi-server/src/main/java/VotingServiceImpl.java).

### 5. Configure the Spring Boot API bridge
1. Open [api-bridge/src/main/resources/application.properties](api-bridge/src/main/resources/application.properties).
2. Set `rmi.server.host` and `rmi.server.port` if the RMI service is running on a different machine.
3. For browser access, list the allowed origins in `app.cors.allowed-origins` (comma-separated). Use `http://localhost:5173` while developing the React client.

### 6. Run the Spring Boot API bridge
```bash
cd api-bridge
mvn spring-boot:run
```
When the app starts it will log `Looking up RMI service at rmi://HOST:PORT/VotingService`. The REST endpoints are implemented in [api-bridge/src/main/java/org/example/apibridge/controller/VotingController.java](api-bridge/src/main/java/org/example/apibridge/controller/VotingController.java).

### 7. (Optional) Run the React frontend
```bash
cd react-frontend
npm install
VITE_API_BASE_URL=http://localhost:8080/api/events npm run dev -- --host 0.0.0.0 --port 5173
```
The frontend consumes the REST endpoints through [react-frontend/src/utils/api.ts](react-frontend/src/utils/api.ts). Skip this step if you only need the backend.

### 8. Create an event and seed data
1. Create an event:
  ```bash
  curl -X POST http://localhost:8080/api/events/create \
      -H "Content-Type: application/json" \
      -d '{"eventName":"Student Council 2026"}'
  ```
  Response example: `{ "data": { "eventId": "AB12CD34", "eventName": "Student Council 2026", "eventPassword": "3F8A1C" } }`.
2. Add candidates (multipart for optional photos):
  ```bash
  curl -X POST http://localhost:8080/api/events/AB12CD34/candidates \
      -F name="Alice" -F photo=@/path/to/photo.jpg
  ```
3. Generate accounts to distribute to voters:
  ```bash
  curl -X POST http://localhost:8080/api/events/AB12CD34/accounts \
      -H "Content-Type: application/json" \
      -d '{"eventSize": 100}'
  ```

### 9. Voting flow (manual test)
1. Login: `POST /api/events/login` with `{ "username": "generatedUser", "password": "plainPassword" }`.
2. Load ballot: `GET /api/events/AB12CD34/candidates?password=EVENT_PASSWORD`.
3. Cast vote: `POST /api/events/AB12CD34/vote` with `{ "userId": "...", "candidateId": "..." }`.
4. Confirm status: `GET /api/events/AB12CD34/vote-status/{userId}`.
5. Monitor results: `GET /api/events/AB12CD34/results` for aggregate counts.

## API Cheat Sheet

| Endpoint | Description |
| --- | --- |
| `/api/events/create` | Create event and return `eventId`, `eventPassword` |
| `/api/events/{eventId}/candidates` | POST add, PUT update, DELETE remove, GET list candidates |
| `/api/events/{eventId}/accounts` | POST bulk-generate login credentials, GET list | 
| `/api/events/login` | Validate username/password via `VotingService.Login` |
| `/api/events/{eventId}/vote` | Cast vote; rejects duplicates with `ALREADY_VOTED` |
| `/api/events/{eventId}/results` | Aggregate vote totals per candidate |
| `/api/events/{eventId}/vote-status/{userId}` | Check if a given user already voted |
| `/api/events/{eventId}/candidates?password=...` | Public ballot retrieval for voters |

## Troubleshooting

- `IllegalStateException: RMI service unavailable`: ensure the RMI process is running, the host/port in [application.properties](api-bridge/src/main/resources/application.properties) is correct, and no firewall blocks port `1099`.
- `Communications link failure` in `DBController`: verify MySQL is listening on `localhost:3306`, credentials in [DBController](rmi-server/src/main/java/DBController.java) are valid, and the schema contains the required tables.
- Voters always “already voted”: clear the `votes` table or use unique `userId` values per event. The schema enforces a composite key `(user_id, event_id)`.
- Photos missing on the frontend: confirm the `photo` column is `MEDIUMBLOB` and the upload request actually includes a file.

## Useful Commands

```bash
# Build every Maven module
mvn clean install

# Run only the API bridge with tests skipped
cd api-bridge && mvn spring-boot:run -DskipTests

# Run unit tests for the backend modules
cd api-bridge && mvn test
cd rmi-server && mvn test

# Frontend production bundle
cd react-frontend && npm run build && npm run preview
```

With the steps above you can run the University of Computer Studies Pathein Voting System entirely on bare metal and iterate on either the RMI or Spring Boot layers with confidence.
