# GetU.ai — Product Specification

**Version:** 0.1 (MVP)
**Last updated:** 2026-03-04

---

## 1. Vision

GetU.ai is a hosted multi-agent GTM (Go-To-Market) execution platform.

A founder describes their product. ARIA — the main orchestrator AI — learns the product,
maps the ICP, proposes an actionable GTM strategy, and upon alignment deploys specialist
agents that autonomously execute tasks across real platforms (Twitter/X, LinkedIn, Reddit,
Discord, etc.).

**Core value proposition:** Compress the timeline from "we need to do GTM" to "leads and
content are actively flowing" from weeks (hire + onboard + manage a person) to hours.

**North star metric:** Number of real, externally-visible GTM actions executed per user per week.

---

## 2. Target User

**Primary:** Early-stage B2B SaaS founders or solo operators who:
- Have a product ready to go to market
- Cannot yet afford a full-time marketing hire
- Have some idea of their ICP but need help executing outreach and content

**Secondary:** Small GTM teams who want to automate repetitive distribution tasks.

---

## 3. Product Flow

### Phase 0 — Onboarding (one-time)
1. User signs up
2. ARIA asks: *"Tell me about your product and who you want to reach."*
3. User describes their product in natural language
4. ARIA extracts and confirms: product summary, value prop, ICP definition, target channels
5. ARIA stores this as the user's **Product Profile** (persists forever, user can update)

### Phase 1 — Strategy Alignment
1. ARIA proposes a GTM strategy: which channels, which agents, what goals
2. User can ask questions, push back, or adjust
3. User confirms the strategy
4. ARIA creates an initial set of **Tasks** and assigns them to agents

### Phase 2 — Execution
1. Agents run autonomously in the background
2. User sees live status in the **Mission Center**
3. Agents report results: leads found, posts published, replies sent, etc.
4. ARIA surfaces a daily/weekly **Morning Report** with highlights and recommendations

### Phase 3 — Iteration
1. User can chat with ARIA at any time to refine strategy
2. User can chat directly with any specialist agent for granular control
3. User can pause, restart, or reprioritize any task

---

## 4. Core Concepts

### ARIA (Orchestrator Agent)
- The primary interface for the user
- Maintains long-term memory of the product, ICP, and strategy decisions
- Decomposes strategy into tasks and assigns them to specialist agents
- Receives agent reports and synthesizes insights for the user
- Never executes platform actions directly — only delegates

### Specialist Agents
Each agent has:
- A defined **domain** (one platform or capability)
- A defined **tool set** (the real actions it can take)
- A defined **input/output contract** (what it receives from ARIA, what it reports back)

### Tasks
A task is a discrete unit of work assigned to an agent. It has:
- A goal (natural language)
- A status (pending / running / completed / failed / paused)
- Executions (the log of what actually happened)
- Results (structured output: leads, posts, signals, etc.)

### Credentials
Users connect their platform accounts (Twitter/X, LinkedIn, etc.).
Credentials are encrypted at rest. Agents use these to take real actions on the user's behalf.

---

## 5. Agent Definitions (MVP + Roadmap)

### ARIA — Orchestrator
| | |
|---|---|
| **Status** | MVP |
| **Domain** | Strategy, memory, coordination |
| **Tools** | read_product_profile, update_product_profile, create_task, list_tasks, read_task_results |
| **Input** | User message |
| **Output** | Strategy text, task creation, recommendations |

---

### SCOUT — Signal & Prospecting Agent
| | |
|---|---|
| **Status** | MVP |
| **Domain** | Twitter/X, LinkedIn, Reddit |
| **Execution** | Browser automation (Steel.dev + Playwright) — no official APIs needed |
| **Purpose** | Find people and posts that match the user's ICP and pain points |

**Capabilities:**

1. **Signal Finding** — Browse Twitter/X and Reddit for posts where people express the pain the user's product solves.
   - Input: ICP definition + pain points from product profile
   - Output: List of posts with URL, author, relevance explanation, suggested reply angle
   - No user credentials required (reads public pages)
   - Platforms: Twitter/X search, Reddit subreddit search

2. **People Finding** — Find ICP-matching individuals on LinkedIn and Twitter/X.
   - Input: ICP definition (title, industry, company size, keywords)
   - Output: List of profiles with name, handle/URL, bio snippet, why they match ICP
   - No user credentials required (reads public pages)
   - Platforms: LinkedIn search, Twitter/X search

3. **Outreach Drafting** — Generate personalized first-touch messages for found targets.
   - Input: Target person's public profile + user's product profile
   - Output: Draft message tailored to that person — never auto-sent, always human-reviewed

4. **Reply Execution** *(requires user to connect Twitter account)*
   - Triggered only after user explicitly approves a drafted reply
   - Input: Post URL + approved reply text
   - Output: Confirmation of reply posted, link to reply

**Browser Actions (internal):**
```
navigate(url)
search(platform, query, filters)
extract_posts(page) → Post[]
extract_profile(url) → Profile
post_reply(post_url, text)   ← requires auth cookie, write action
```

---

### PULSE — Twitter Content Agent
| | |
|---|---|
| **Status** | Phase 2 |
| **Domain** | Twitter/X |
| **Purpose** | Build thought leadership and audience via content |

**Capabilities:**
1. **Thread Writing** — Write Twitter threads aligned with ICP pain points
2. **Trend Monitoring** — Surface relevant trending topics in the user's niche
3. **Engagement** — Reply to conversations in the user's target community
4. **Scheduling** — Schedule posts for optimal times

**Tools:** `write_thread`, `search_trends`, `post_tweet`, `schedule_tweet`, `engage_reply`

---

### FORGE — SEO Content Agent
| | |
|---|---|
| **Status** | Phase 2 |
| **Domain** | Blog / SEO |
| **Purpose** | Build organic search presence |

**Capabilities:** Keyword research, blog post writing, on-page SEO, content calendar management

---

### HERALD — Email Agent
| | |
|---|---|
| **Status** | Phase 3 |
| **Domain** | Email |
| **Purpose** | Newsletter, drip sequences, nurture |

---

### LENS — Intelligence Agent
| | |
|---|---|
| **Status** | Phase 3 |
| **Domain** | Competitive intelligence |
| **Purpose** | Monitor competitors, track market signals |

---

### COMMUNITY — Discord/Telegram Agent
| | |
|---|---|
| **Status** | Phase 2 |
| **Domain** | Discord, Telegram |
| **Purpose** | Find relevant communities and craft authentic presence |

**Capabilities:**
1. **Community Discovery** — Find Discord servers and Telegram groups where ICP gathers
   - Input: ICP profile + product category
   - Output: List of communities with name, size, invite link, relevance score, suggested approach

2. **Intro Drafting** — Write a channel intro that naturally introduces the product
   - Input: Community context + user's product
   - Output: Draft intro message (human reviews before posting — never auto-post in communities)
   - Note: Auto-posting in communities risks ban and brand damage; this step is always human-approved

---

## 6. Data Models

### `users`
```
id            uuid PK
email         text UNIQUE
created_at    timestamp
```

### `product_profiles`
```
id                uuid PK
user_id           uuid FK → users.id UNIQUE
name              text          -- product name
description       text          -- full product description (user's words)
value_prop        text          -- extracted by ARIA: one-sentence value proposition
icp_summary       text          -- extracted by ARIA: who the ideal customer is
icp_titles        text[]        -- e.g. ["Head of Logistics", "VP Operations"]
icp_industries    text[]        -- e.g. ["Freight", "3PL", "Supply Chain"]
icp_company_size  text          -- e.g. "200-2000 employees"
pain_points       text[]        -- top 3-5 problems the product solves
target_channels   text[]        -- channels ARIA recommends: ["twitter", "linkedin", ...]
updated_at        timestamp
```

### `conversations`
```
id          uuid PK
user_id     uuid FK → users.id
agent_name  text          -- "ARIA" | "SCOUT" | etc.
created_at  timestamp
```

### `messages`
```
id              uuid PK
conversation_id uuid FK → conversations.id
role            text     -- "user" | "assistant" | "tool"
content         text
tool_calls      jsonb    -- if role = "assistant" with tool use
tool_results    jsonb    -- if role = "tool"
created_at      timestamp
```

### `tasks`
```
id              uuid PK
user_id         uuid FK → users.id
agent_name      text           -- "SCOUT" | "PULSE" | etc.
title           text           -- human-readable task description
goal            text           -- full natural language goal passed to agent
status          text           -- "pending" | "running" | "completed" | "failed" | "paused"
priority        int            -- 1 (highest) to 5
result_summary  text           -- agent's final report (populated on completion)
result_data     jsonb          -- structured results (leads[], posts[], signals[])
error           text           -- error message if failed
created_at      timestamp
started_at      timestamp
completed_at    timestamp
```

### `executions`
```
id          uuid PK
task_id     uuid FK → tasks.id
step        int           -- sequential step number within the task
tool_name   text          -- which tool was called
tool_input  jsonb
tool_output jsonb
status      text          -- "success" | "error"
duration_ms int
created_at  timestamp
```

### `credentials`
```
id              uuid PK
user_id         uuid FK → users.id
platform        text      -- "twitter" | "linkedin" | "reddit" | etc.
access_token    text      -- encrypted
refresh_token   text      -- encrypted
token_expires_at timestamp
scope           text[]    -- what permissions were granted
created_at      timestamp
updated_at      timestamp
```

---

## 7. API Design

Base URL: `/api/v1/`
Auth: Supabase JWT in `Authorization: Bearer <token>` header

### Chat (ARIA)
```
POST   /api/v1/chat                   Start/continue ARIA conversation (streaming SSE)
GET    /api/v1/conversations          List user's conversations
GET    /api/v1/conversations/:id      Get conversation with messages
```

### Product Profile
```
GET    /api/v1/product                Get user's product profile
PUT    /api/v1/product                Update product profile
```

### Tasks
```
GET    /api/v1/tasks                  List all tasks (with status filter)
GET    /api/v1/tasks/:id              Get task detail with executions
POST   /api/v1/tasks/:id/pause        Pause a running task
POST   /api/v1/tasks/:id/resume       Resume a paused task
DELETE /api/v1/tasks/:id              Cancel and delete a task
```

### Agents
```
GET    /api/v1/agents                 List available agents with status
POST   /api/v1/agents/:name/chat      Chat directly with a specialist agent (streaming)
```

### Credentials
```
GET    /api/v1/credentials            List connected platforms (no tokens returned)
POST   /api/v1/credentials/twitter    Start Twitter OAuth flow
DELETE /api/v1/credentials/:platform  Disconnect a platform
```

---

## 8. Real-time Events (Supabase Realtime)

Frontend subscribes to changes on `tasks` table for the current user:
```
tasks:user_id=eq.<userId>
```

Events pushed to frontend:
- Task created → Mission Center adds card
- Task status changed → card updates in real-time
- Task result_summary updated → result appears without page refresh

---

## 9. MVP Scope (Phase 1)

**Core principle:** Read-only actions first. Write actions require explicit user confirmation.
No official platform APIs needed — browser automation handles all platform interactions.

**In scope:**
- [ ] User auth (Supabase email + Google OAuth)
- [ ] Product onboarding (ARIA extracts product profile from conversation)
- [ ] ARIA chat with streaming (Claude Sonnet, full conversation history)
- [ ] ARIA generates GTM strategy and creates tasks
- [ ] Browser execution layer (Steel.dev in prod, local Playwright in dev)
- [ ] SCOUT: signal finding — Twitter/X + Reddit (read-only, no login needed)
- [ ] SCOUT: people finding — LinkedIn + Twitter/X (read-only, no login needed)
- [ ] SCOUT: outreach draft generation (human reviews, not auto-sent)
- [ ] Mission Center: live task status + execution log (Supabase Realtime)
- [ ] Twitter session connection (user logs in via browser session, not OAuth API)
- [ ] SCOUT: post reply on Twitter after user approves draft

**Out of scope for MVP:**
- PULSE, FORGE, HERALD, LENS agents
- Auto-send without confirmation
- Discord/Telegram community finding
- Mobile responsive design
- Email notifications
- Billing / usage limits

---

## 10. Security Considerations

1. **Credential encryption:** All OAuth tokens encrypted with AES-256 before storage.
   Decryption only happens in the server at execution time.

2. **Rate limiting:** All agent tools respect platform rate limits. BullMQ handles backoff.

3. **User isolation:** Every database query scoped to `user_id`. No cross-user data access possible.

4. **Prompt injection:** Agent tool results are treated as untrusted data.
   Tool outputs are never interpolated directly into system prompts.

5. **Audit log:** Every tool execution logged in `executions` table with input/output.

6. **Scope minimalism:** Request only the OAuth scopes actually needed.
   Twitter: `tweet.read tweet.write users.read` — nothing more.
