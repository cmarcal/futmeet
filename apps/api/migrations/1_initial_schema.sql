-- rooms
CREATE TABLE IF NOT EXISTS rooms (
  id          VARCHAR(21)  PRIMARY KEY,          -- nanoid alphanumeric 21-char
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- room_players
CREATE TABLE IF NOT EXISTS room_players (
  id          UUID         PRIMARY KEY,           -- crypto.randomUUID()
  room_id     VARCHAR(21)  NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name        VARCHAR(50)  NOT NULL,
  priority    BOOLEAN      NOT NULL DEFAULT FALSE,
  notes       VARCHAR(500),
  position    INTEGER      NOT NULL,              -- 0-based; unique per room (sort key)
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_room_players_room_id ON room_players(room_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_room_players_position ON room_players(room_id, position);

-- games
CREATE TABLE IF NOT EXISTS games (
  id          VARCHAR(21)  PRIMARY KEY,           -- nanoid (may equal room.id if from room)
  room_id     VARCHAR(21)  REFERENCES rooms(id),  -- NULL if created directly
  team_count  INTEGER      NOT NULL DEFAULT 2
                           CHECK (team_count BETWEEN 2 AND 10),
  game_status VARCHAR(10)  NOT NULL DEFAULT 'setup'
                           CHECK (game_status IN ('setup', 'complete')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- game_players
CREATE TABLE IF NOT EXISTS game_players (
  id          UUID         PRIMARY KEY,           -- crypto.randomUUID()
  game_id     VARCHAR(21)  NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name        VARCHAR(50)  NOT NULL,
  priority    BOOLEAN      NOT NULL DEFAULT FALSE,
  notes       VARCHAR(500),
  position    INTEGER      NOT NULL,              -- 0-based ordering
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON game_players(game_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_players_position ON game_players(game_id, position);

-- teams (deleted + re-inserted on each sort call)
CREATE TABLE IF NOT EXISTS teams (
  id          UUID         PRIMARY KEY,           -- crypto.randomUUID() per sort
  game_id     VARCHAR(21)  NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name        VARCHAR(50)  NOT NULL,              -- "Time 1", "Time 2", ...
  position    INTEGER      NOT NULL               -- 1-based team order
);
CREATE INDEX IF NOT EXISTS idx_teams_game_id ON teams(game_id);

-- team_players (junction)
CREATE TABLE IF NOT EXISTS team_players (
  team_id         UUID  NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  game_player_id  UUID  NOT NULL REFERENCES game_players(id),
  PRIMARY KEY (team_id, game_player_id)
);
