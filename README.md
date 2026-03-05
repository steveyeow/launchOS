# GetU.ai

A hosted multi-agent GTM execution platform. Describe your product, align on strategy with ARIA, and watch specialist agents execute your go-to-market across Twitter/X, LinkedIn, Reddit, and more — autonomously.

---

## What It Does

1. **Onboard** — Tell ARIA about your product and who you want to reach
2. **Align** — ARIA proposes a GTM strategy; you refine it together
3. **Execute** — Specialist agents autonomously run outreach, content, and prospecting
4. **Monitor** — Mission Center shows live agent status, tasks, and results
5. **Iterate** — Chat with ARIA or individual agents to adjust strategy anytime

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend (Vite + React)         │
│  ARIA Chat  │  Mission Center  │  Agent Marketplace│
└──────────────────────┬──────────────────────────┘
                       │ REST + SSE
┌──────────────────────▼──────────────────────────┐
│              Backend (Hono + Node.js)             │
│                                                   │
│  ┌─────────┐   ┌──────────┐   ┌───────────────┐  │
│  │  ARIA   │   │  Routes  │   │  Credentials  │  │
│  │Orchestr.│   │ /chat    │   │   (encrypted) │  │
│  └────┬────┘   │ /tasks   │   └───────────────┘  │
│       │        │ /agents  │                       │
│  ┌────▼────────────────┐  │                       │
│  │    BullMQ Queue      │  │                       │
│  └────┬────────────────┘  │                       │
│       │                    │                       │
│  ┌────▼────┐  ┌─────────┐ │                       │
│  │  SCOUT  │  │  PULSE  │ │  ← Specialist Agents  │
│  └────┬────┘  └────┬────┘ │                       │
└───────┼─────────────┼─────┘
        │             │
   ┌────▼─────────────▼────┐
   │   External Platforms   │
   │  Twitter/X  │ LinkedIn │
   └───────────────────────┘
        │
   ┌────▼──────────┐
   │   Supabase    │
   │  DB │ Auth    │
   │  Realtime     │
   └───────────────┘
```

**Key design decisions:**
- ARIA orchestrates but never executes platform actions directly
- All agent tasks run through BullMQ for reliability and retry
- Real-time status updates via Supabase Realtime (no polling)
- Unified TypeScript stack (frontend + backend + shared types)

See [`docs/SPEC.md`](docs/SPEC.md) for full product specification.
See [`CLAUDE.md`](CLAUDE.md) for development guide and conventions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Node.js, Hono, TypeScript |
| AI | Anthropic Claude API, Vercel AI SDK |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Real-time | Supabase Realtime |
| Job Queue | BullMQ + Redis |
| ORM | Drizzle |
| Frontend hosting | Vercel |
| Backend hosting | Railway |

---

## Local Development

### Prerequisites
- Node.js 20+
- A Supabase project
- An Anthropic API key
- Redis (local or Railway)

### Setup

```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd server && npm install

# 3. Configure environment variables
cp .env.example .env
cp server/.env.example server/.env
# Fill in your keys in both files

# 4. Run database migrations
cd server && npm run db:migrate

# 5. Start development servers (two terminals)
npm run dev           # Frontend on :5173
cd server && npm run dev   # Backend on :3000
```

---

## Project Status

**Current phase:** MVP development

MVP delivers:
- ARIA chat with full product onboarding
- GTM strategy generation
- SCOUT agent (Twitter/X signal + people finding)
- Mission Center with live task status
- Twitter/X credential connection and reply execution

See [`docs/SPEC.md`](docs/SPEC.md) for full roadmap.
