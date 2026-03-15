# @futmeet/api

REST API for Futmeet — manages rooms, players, games and team sorting for casual football pickup games.

---

## Architecture

The API follows a **layered architecture** with manual dependency injection wired at the composition root (`src/index.ts`).

```
HTTP Request
    ↓
Route         — endpoint definitions, JSON schemas, request validation
    ↓
Controller    — parses request, calls service, formats response
    ↓
Service       — business rules, error translation, orchestration
    ↓
Repository    — transaction management, ACID guards, WriteResult<T>
    ↓
Query         — raw SQL execution, row → domain type mapping
    ↓
PostgreSQL
```

Each module owns its full vertical slice. Dependencies flow downward — services never import from controllers, repositories never import from services.

### Key design decisions

- **Composition root** — all dependencies are wired manually in `src/index.ts`. No DI container.
- **Pessimistic locking** — write operations use `SELECT ... FOR UPDATE` inside a transaction to prevent TOCTOU race conditions (e.g. two concurrent `startGame` calls).
- **WriteResult\<T\>** — repository write methods return a discriminated union `{ ok: true, data: T } | { ok: false, reason: string }` instead of throwing, keeping control flow explicit.
- **Query/Repository split** — `query/` holds raw SQL and row mapping; `repository/` owns transactions and guards. This makes each layer independently testable.

---

## Project structure

```
src/
├── index.ts              # Entry point: boots Fastify, wires dependencies, starts server
├── config.ts             # Reads and validates environment variables
│
├── core/
│   ├── decorator/        # Attaches pg Pool to Fastify instance (fastify.db)
│   ├── documentation/    # Swagger/OpenAPI setup — served at /docs
│   ├── error/            # AppError base class and global error handler
│   ├── framework/        # pg Pool factory, DbPool and DbClient types
│   └── logger/           # Pino logger (pretty in dev, JSON in prod)
│
├── modules/
│   ├── room/             # Room module (see Modules section)
│   └── game/             # Game module (see Modules section)
│
├── migrations/           # Knex migration files (one table per file)
└── seeds/                # Knex seed data for local development
```

---

## Modules

### Room module (`src/modules/room/`)

Manages rooms — waiting areas where players are collected before a game starts.

| Layer | Responsibility |
|---|---|
| `route/` | Registers 8 Fastify routes under `/api/v1/rooms` |
| `controller/` | HTTP handlers — parse params/body, call service, set status codes |
| `service/` | Business rules: room must exist, room must not have started, player must exist |
| `repository/` | Transactions with `SELECT FOR UPDATE` lock; returns `WriteResult<T>` |
| `query/` | All SQL for rooms and room_players; row → `Room`/`Player` mapping |
| `entity/` | DB row types (`RoomRow`, `RoomPlayerRow`) |
| `error/` | `RoomNotFound` (404), `RoomPlayerNotFound` (404), `RoomAlreadyStarted` (409), `InvalidReorderIndices` (400) |


---

### Game module (`src/modules/game/`)

Manages games — created from a room or standalone, tracks players and team assignments.

| Layer | Responsibility |
|---|---|
| `route/` | Registers 8 Fastify routes under `/api/v1/games` |
| `controller/` | HTTP handlers |
| `service/` | Business rules: game must exist, team count must be 2–10 |
| `repository/` | Transactions; `createFromRoom` locks the room row to prevent duplicate games |
| `query/` | All SQL for games, game_players, teams, team_players; full assembly in `findById` |
| `entity/` | DB row types (`GameRow`, `GamePlayerRow`, `TeamRow`, `TeamPlayerRow`) |
| `error/` | `GameNotFound` (404), `GamePlayerNotFound` (404), `InvalidTeamCount` (400), `InvalidReorderIndices` (400) |

---

## Libraries

| Library | Purpose |
|---|---|
| **fastify** | HTTP framework — fast, schema-based, low overhead |
| **@fastify/cors** | CORS middleware |
| **@fastify/swagger** + **@fastify/swagger-ui** | OpenAPI spec generation; interactive docs at `/docs` |
| **pg** | PostgreSQL client — connection pooling, parameterized queries |
| **knex** | Migration runner and schema builder — used only for `db:*` scripts |
| **pino** + **pino-pretty** | Structured logging — JSON in production, pretty-printed in development |
| **@futmeet/shared** | Internal monorepo package — domain types (`Room`, `Player`, `Game`, `Team`) and utilities (`generateGameId`, `generatePlayerId`, `sortTeams`) |
| **tsx** | Runs TypeScript files directly — used by migration/seed scripts and `dev` watch |
| **vitest** | Unit testing framework |
| **oxlint** | Fast linter (Rust-based ESLint replacement) |

---

## Getting started

### Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL)

### 1. Environment

```bash
cp .env.example .env
```

Default values work out of the box with the Docker setup:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/futmeet
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

### 2. Start the database

```bash
npm run db:up       # starts postgres:16 on port 5432
```

### 3. Run migrations

```bash
npm run db:migrate  # creates all tables
```

To also load seed data (8 players, 1 completed game, 2 teams):

```bash
npm run db:seed
```

Or do both at once:

```bash
npm run db:fresh    # rollback all → migrate → seed
```

### 4. Start the API

```bash
npm run dev         # hot reload at http://localhost:3001
```

Interactive API docs are available at **http://localhost:3001/docs**.

---

## Database scripts

| Script | Description |
|---|---|
| `npm run db:up` | Start Docker Postgres |
| `npm run db:down` | Stop Docker Postgres |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:rollback` | Rollback last migration batch |
| `npm run db:reset` | Rollback all + migrate latest |
| `npm run db:seed` | Run seed file |
| `npm run db:fresh` | Reset + seed (clean slate) |
| `npm run db:status` | Show migration status |

---

## Other scripts

```bash
npm run build   # compile TypeScript → dist/
npm run start   # run compiled app
npm run test    # run unit tests
npm run lint    # run oxlint
```
