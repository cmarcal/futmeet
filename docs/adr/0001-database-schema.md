# ADR 0001 — Database Schema

**Status**: Accepted
**Date**: 2026-03-14
**Branch**: `docs/db-schema-adr`

---

## Context

Futmeet needs a persistent backend (Phase 1 REST API) to replace the current client-only Zustand state. Players, rooms, and games must be stored server-side so multiple clients can share data.

Key constraints from the frontend code (`apps/web/src/`):

- Room and game IDs are generated with `nanoid` — 21-char alphanumeric strings.
- Player IDs are generated with `crypto.randomUUID()` — standard UUID format.
- `Player` has `notes?: string` (max ~500 chars).
- `GameStatus = 'setup' | 'sorting' | 'complete'` — but `'sorting'` is a transient client-side animation state; the server only ever persists `'setup'` or `'complete'`.
- Team sort is atomic: one call deletes old teams and inserts new ones in a single transaction, enabling safe re-sorting.

---

## Decision

### 5-Table Normalized Schema (Postgres)

```
rooms               room_players
──────────────────  ─────────────────────────────
PK  id VARCHAR(21)  PK  id        UUID
    created_at      FK  room_id   → rooms.id
                        name      VARCHAR(50)
                        priority  BOOLEAN
                        notes     VARCHAR(500) NULL
                        position  INTEGER (0-based, unique per room)
                        created_at

games
───────────────────────────────
PK  id          VARCHAR(21)
FK? room_id     → rooms.id (NULL if created directly)
    team_count  INTEGER [2–10]
    game_status VARCHAR(10) CHECK IN ('setup', 'complete')
    created_at

game_players            teams
──────────────────────  ──────────────────────────
PK  id   UUID           PK  id       UUID
FK  game_id → games.id  FK  game_id  → games.id
    name VARCHAR(50)        name     VARCHAR(50)
    priority BOOLEAN        position INTEGER (1-based)
    notes VARCHAR(500) NULL
    position INTEGER
    created_at

team_players (junction)
────────────────────────────────────────
FK PK  team_id        → teams.id
FK PK  game_player_id → game_players.id
```

### Key decisions per table

| Decision | Rationale |
|---|---|
| `rooms.id = VARCHAR(21)` | Matches `nanoid` 21-char alphanumeric output |
| `room_players.id = UUID` | Matches `crypto.randomUUID()` used in frontend |
| `game_status` only `'setup'\|'complete'` | `'sorting'` is a UI animation state, never durable |
| `notes VARCHAR(500) NULLABLE` | Matches `Player.notes?: string` from frontend types |
| `position INTEGER` unique per parent | Enables stable, server-authoritative ordering without rewriting all rows on every change |
| `teams` deleted + re-inserted on each sort | Makes re-sorting idempotent; a single transaction ensures atomicity |
| `games.room_id NULLABLE` | Supports "Nova Partida" flow (game without a room) |
| Room frozen after game start | Once `games.room_id = room.id` exists, room mutation returns 409 Conflict |

### ID type summary

| Entity | Generator | Format | Column type |
|---|---|---|---|
| Room | `nanoid` (alphanumeric) | 21 chars `[A-Za-z0-9]` | `VARCHAR(21)` |
| Game | `nanoid` (alphanumeric) | 21 chars `[A-Za-z0-9]` | `VARCHAR(21)` |
| Player (room or game) | `crypto.randomUUID()` | UUID v4 | `UUID` |
| Team | `crypto.randomUUID()` | UUID v4 | `UUID` |

### `isValidGameId` regex fix

The frontend regex `/^[A-Za-z0-9_-]{21}$/` incorrectly accepts `_` and `-`, which are not in the nanoid alphabet. The corrected regex (in `packages/shared`) is `/^[A-Za-z0-9]{21}$/`.

### Migration tool

**`node-pg-migrate`** with raw SQL. Rationale:
- No ORM — fits the class-based repository pattern in `apps/api`
- Raw SQL is explicit and reviewable
- `node-pg-migrate` integrates cleanly with Node.js scripts via `npm run migrate`

---

## Consequences

**Positive**:
- Schema matches frontend types exactly — no surprise shape mismatches
- Normalized tables avoid JSON column pitfalls (partial updates, indexing, type safety)
- Atomic sort transaction prevents partial-state corruption on re-sort
- Room freeze on game start prevents race conditions

**Negative / Trade-offs**:
- More tables than a JSON-column approach; more joins needed on reads
- `position` uniqueness constraint requires careful update ordering on reorder (shift positions before insert)

---

## ER Diagram

Interactive diagram: [https://excalidraw.com/#json=xsOSyOtdaSg8tVC1OJwvj,D7DZ16_Nh-xnWFAUhZ37NA](https://excalidraw.com/#json=xsOSyOtdaSg8tVC1OJwvj,D7DZ16_Nh-xnWFAUhZ37NA)

```
rooms (blue)        ──1:N──>  room_players (teal)
rooms (blue)        ──0:N──>  games (purple)        [optional, via games.room_id]
games (purple)      ──1:N──>  game_players (teal)
games (purple)      ──1:N──>  teams (green)
teams (green)       ──N:M──>  game_players (via team_players junction, orange)
```

---

## Full SQL (initial migration)

See `apps/api/migrations/1_initial_schema.sql`.
