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

The app requires three tables in Supabase:

### 1. `games` table

```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase TEXT DEFAULT 'lobby' CHECK (phase IN ('lobby', 'prompt', 'reveal', 'discussion', 'end')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Columns:**
- `id` (UUID): Unique game identifier
- `phase` (TEXT): Current phase of the game
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
  mind_state TEXT,
  text_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_responses_game_id ON responses(game_id);
CREATE INDEX idx_responses_player_id ON responses(player_id);
```

**Columns:**
- `id` (UUID): Unique response identifier
- `game_id` (UUID): Foreign key to the game
- `player_id` (UUID): Foreign key to the player
- `mind_state` (TEXT): Which mind state the player selected (Emotion Mind, Reasonable Mind, Wise Mind)
- `text_response` (TEXT): The player's reflection text
- `created_at` (TIMESTAMPTZ): When the response was submitted

## Supabase Configuration

1. Enable Row Level Security (RLS) if needed, or allow public access for testing
2. Make sure the tables are created with the schema above
3. Verify foreign key constraints are properly set up

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
