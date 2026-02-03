# DBT Game - Setup Guide

## Prerequisites

### Environment Variables

Create a `.env.local` file in the root directory with these values:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Get these from your Supabase project settings.

## Database Schema

The app requires several tables in Supabase:

### 1. `games` table

```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID,
  phase TEXT DEFAULT 'lobby' CHECK (phase IN ('lobby', 'prompt', 'reveal', 'discussion', 'end', 'opposite_action_race', 'race_reveal')),
  mode TEXT DEFAULT 'reflection' CHECK (mode IN ('reflection', 'opposite_action_race')),
  prompt TEXT,
  current_round INTEGER DEFAULT 0,
  scores JSONB DEFAULT '{}',
  race_prompt JSONB,
  race_winner UUID,
  race_responses JSONB,
  race_time_left INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Columns:**
- `id` (UUID): Unique game identifier
- `host_id` (UUID): ID of the host player
- `phase` (TEXT): Current phase of the game
- `mode` (TEXT): Game mode (reflection or opposite_action_race)
- `prompt` (TEXT): Current prompt for reflection
- `current_round` (INTEGER): Current round number (incremented after each prompt)
- `scores` (JSONB): Player scores as key-value pairs
- `race_prompt` (JSONB): Current race prompt with emotion, scenario, urge
- `race_winner` (UUID): ID of the race winner
- `race_responses` (JSONB): Array of race responses
- `race_time_left` (INTEGER): Seconds remaining in the current race (null when not racing)
- `created_at` (TIMESTAMPTZ): When the game was created

### 2. `players` table

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_players_game_id ON players(game_id);
```

**Columns:**
- `id` (UUID): Unique player identifier
- `game_id` (UUID): Foreign key to the game
- `name` (TEXT): Player's display name
- `created_at` (TIMESTAMPTZ): When the player joined

### 3. `responses` table

```sql
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  round INTEGER DEFAULT 0,
  prompt TEXT,
  mind_state TEXT,
  text_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_responses_game_id ON responses(game_id);
CREATE INDEX idx_responses_player_id ON responses(player_id);
CREATE INDEX idx_responses_game_round ON responses(game_id, round);
```

### 4. `race_responses` table

```sql
CREATE TABLE race_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_race_responses_game_id ON race_responses(game_id);
CREATE INDEX idx_race_responses_player_id ON race_responses(player_id);
```

**Columns:**
- `id` (UUID): Unique response identifier
- `game_id` (UUID): Foreign key to the game
- `player_id` (UUID): Foreign key to the player
- `action` (TEXT): The player's opposite action response
- `timestamp` (BIGINT): Timestamp when response was submitted
- `created_at` (TIMESTAMPTZ): When the response was created

### 5. `favorites` table

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, player_id, response_id)
);

CREATE INDEX idx_favorites_game_id ON favorites(game_id);
CREATE INDEX idx_favorites_response_id ON favorites(response_id);
```

**Columns:**
- `id` (UUID): Unique favorite identifier
- `game_id` (UUID): Foreign key to the game
- `player_id` (UUID): Foreign key to the player who favorited
- `response_id` (UUID): Foreign key to the favorited response
- `created_at` (TIMESTAMPTZ): When the favorite was created

### 6. `race_response_favorites` table

```sql
CREATE TABLE race_response_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  race_response_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(game_id, player_id, race_response_id)
);

CREATE INDEX idx_race_response_favorites_game_id ON race_response_favorites(game_id);
```

**Columns:**
- `id` (UUID): Unique favorite identifier
- `game_id` (UUID): Foreign key to the game
- `player_id` (UUID): Foreign key to the player who favorited
- `race_response_id` (TEXT): ID of the favorited race response (composite key)
- `created_at` (TIMESTAMPTZ): When the favorite was created

## Database Functions

### increment_round Function

```sql
CREATE OR REPLACE FUNCTION increment_round(game_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE games
  SET current_round = current_round + 1
  WHERE id = game_id;
END;
$$ LANGUAGE plpgsql;
```

## Supabase Configuration

1. Enable Row Level Security (RLS) if needed, or allow public access for testing
2. Make sure the tables are created with the schema above
3. Verify foreign key constraints are properly set up
4. Create the `increment_round` function (see Database Functions section above)

## Running the App

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Visit `http://localhost:3000/dbt-game` to access the app.

## Troubleshooting

### "Creating game..." stuck on host page
- Check that environment variables are set correctly
- Verify the `games` table exists in Supabase
- Check browser console and server logs for errors
- Ensure service role key has permissions to insert into games table

### Cannot join games
- Verify `players` table exists and `game_id` foreign key is set up
- Check that anon key has permission to insert into players table

### Responses not showing
- Verify `responses` table exists with proper foreign keys
- Check that all required columns exist
