-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  cognito_id TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  games_played INTEGER NOT NULL DEFAULT 0,
  games_won INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  meeting_id TEXT NOT NULL,
  state TEXT NOT NULL,
  host_id TEXT NOT NULL,
  players JSONB NOT NULL,
  settings JSONB NOT NULL,
  current_round INTEGER NOT NULL,
  current_word TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  state TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  max_participants INTEGER NOT NULL,
  participants JSONB NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_cognito_id ON users(cognito_id);
CREATE INDEX IF NOT EXISTS idx_games_host_id ON games(host_id);
CREATE INDEX IF NOT EXISTS idx_games_state ON games(state);
CREATE INDEX IF NOT EXISTS idx_tournaments_state ON tournaments(state);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_time ON tournaments(start_time);
