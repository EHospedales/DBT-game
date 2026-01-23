# DBT Game - AI Coding Agent Instructions

## Project Overview

DBT Game is a Next.js 16 multiplayer web application for facilitating group reflection exercises using Dialectical Behavior Therapy (DBT) concepts. Players join games via codes, respond to prompts categorized by DBT skills (Wise Mind, Emotion Regulation, Distress Tolerance, Interpersonal Effectiveness), and participate in guided discussions.

## Architecture & Data Flow

### Frontend Stack
- **Framework**: Next.js 16 (App Router) with React 19
- **Styling**: Tailwind CSS 4 + custom color palette (earthy tones: #4A3F35 brown, #C9A27C tan, #E8D8C4 cream)
- **Animations**: Framer Motion for transitions (see `BreathingTransition.tsx`)
- **UI Components**: Radix UI + shadcn patterns in `components/ui/`
- **QR Codes**: `qrcode.react` for game code sharing

### Backend Services
- **Database**: Supabase (PostgreSQL) with client and server-side Supabase instances
  - Client: `app/dbt-game/lib/supabase.ts` (anon key for real-time subscriptions)
  - Server: `lib/supabaseServer.ts` (service role key for privileged operations)
- **API Routes**: Next.js route handlers in `app/api/game/*` (create, join, next, respond)

### Game State Architecture
- Centralized `GameState` type in `app/dbt-game/lib/gameState.ts`: contains id, hostId, players, currentRound, prompt, responses, phase
- Game phases: `"lobby" | "prompt" | "reveal" | "discussion" | "end"`
- Player responses stored per-game with mind state and reflection text
- Real-time updates via Supabase subscriptions (client-side subscriptions in pages)

## Project Conventions & Patterns

### Naming & File Organization
- **Page structures**: Feature-based directories under `app/dbt-game/` (enter, host, join, play, waiting)
- **Components**: UI components prefixed with capital letters, located in `dbt-game/components/`
- **Utilities**: General utils in `lib/utils.ts` (includes `cn()` classname helper using clsx + tailwind-merge)
- **Library files**: Shared logic in `lib/` folder with `*-typed` files for types

### Supabase Integration Patterns
- **Client-side**: Use `supabase` from `app/dbt-game/lib/supabase.ts` for real-time .on('INSERT') subscriptions
- **Server-side**: Use `supabaseServer` from `lib/supabaseServer.ts` for admin operations
- API route example: POST to `/api/game/respond` sends playerId, gameId, response object with mindState and reflection
- Table structure: responses(game_id, player_id, mind_state, text_response), players(game_id, name)

### React & Next.js Conventions
- **Client Components**: Use `"use client"` directive for interactive components
- **Dynamic Export**: Pages use `export const dynamic = "force-dynamic"` to prevent static caching
- **Navigation**: Next.js `useRouter()` from `next/navigation` for client-side routing
- **Forms**: Manual form handling with useState; POST to API routes as JSON

### Styling Approach
- **Color System**: Fixed palette (brown #4A3F35, tan #C9A27C, cream #E8D8C4) with dark mode variants
- **Utilities**: Use `cn()` helper function from `lib/utils.ts` for conditional Tailwind classes
- **Component patterns**: Cards use rounded-lg/rounded-2xl, padding via p-6, consistent spacing with space-y-*

## Critical Developer Workflows

### Local Development
```bash
npm run dev          # Start Next.js dev server on http://localhost:3000
npm run build        # Production build
npm run start        # Run production build
npm run lint         # Run ESLint
```

### Environment Setup
- Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Supabase schema expected: tables `players`, `responses`, `games` with appropriate foreign keys

### Testing Workflow
- No automated tests currently configured; manual testing via browser
- QR code generation for easy multi-device testing (generate via `qrcode.react`)

## Integration Points & Dependencies

### External Dependencies
- **Supabase JS**: Real-time database client (v2.91.0)
- **Framer Motion**: Animation library (v12.28.1)
- **Tailwind CSS**: Utility-first styling (v4)
- **Radix UI**: Unstyled component primitives
- **Next.js**: Full-stack React framework (v16.1.4)

### Cross-Component Communication
- **Top-level state sync**: Use Supabase real-time subscriptions rather than React Context
- **Game phases trigger page navigation**: Host controls phase progression via `/api/game/next`
- **Player responses collected**: Individual form submission to `/api/game/respond` API
- **QR codes for game discovery**: Generated dynamically at host stage

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/dbt-game/lib/gameState.ts` | Core GameState type definition |
| `app/dbt-game/lib/prompts.ts` | DBT prompt database (4 categories, 100+ prompts) |
| `app/dbt-game/lib/supabase.ts` | Client Supabase instance |
| `lib/supabaseServer.ts` | Server-side Supabase (admin operations) |
| `app/dbt-game/page.tsx` | Main game lobby entry point |
| `app/dbt-game/components/*.tsx` | Reusable game components (PromptCard, PlayerList, Timer, etc.) |
| `app/api/game/*` | API endpoints for game operations |
| `lib/utils.ts` | Shared utility functions (cn, classname merging) |

## Quick Patterns for New Features

- **Adding new prompts**: Extend `dbtPrompts` array in `app/dbt-game/lib/prompts.ts` with `{ id, category, text }`
- **Adding API endpoints**: Create route handler in `app/api/game/[operation]/route.ts` with POST/GET logic
- **Creating new game phase**: Add phase to GamePhase union type, implement corresponding page component
- **Database operations**: Use Supabase `.from('table').insert/select/update/delete()` with error handling
- **Real-time updates**: Subscribe with `supabase.on('postgres_changes', { event: 'INSERT', ... }).on('subscribe', ...)`

## Notes for Agents

- Always validate environment variables before Supabase operations
- Game IDs are typically UUID strings; player responses keyed by player ID
- Dark mode support is implemented—test both light and dark variants when styling
- Consider rate limiting on API routes for multiplayer scenarios
- Maintain the warm, reflective tone in UI text (focus on emotional awareness, non-judgment)
