# Project ELEVATE — ESL Portal
## CLAUDE.md — Agent Instructions

> **English Learning Enhanced Via AI, Technology & Experience**  
> ESL Grade 12 · Escuela Superior Fernando Suria Chaves · Barceloneta, Puerto Rico  
> Teacher: Prof. Carlos Olivera · Department of Education of Puerto Rico

---

## What This Project Is

A full-stack web application for a Grade 12 ESL flipped classroom. Students access assigned pre-class material at home, then complete the day's assignment inside the app during class. The teacher has a dashboard to manage content, view responses, and generate instructional materials with AI.

This is a **real production app** that will be used by students starting August 2026. Build everything production-ready, not demo-quality.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | CSS Modules (currently), migrating to Tailwind |
| AI Tutor | Anthropic Claude API via Express proxy (`server.js`) |
| Auth | Supabase Auth (email + password) |
| Data | Supabase (PostgreSQL) — tables: profiles, assignments, materials, student_responses |
| Deploy (target) | Vercel |
| Repo | github.com/CarlosAOlivera/esl-portal |

---

## Repository Structure

```
esl-portal/
├── CLAUDE.md                  ← this file
├── public/
├── server.js                  ← Express proxy for Anthropic API (dev only)
├── api/
│   └── anthropic.js           ← Vercel serverless function (to be created)
├── supabase/
│   └── migrations/
│       └── 20260603000000_initial_schema.sql
├── src/
│   ├── assets/
│   ├── auth/
│   │   └── msalConfig.js      ← unused, can be deleted
│   ├── components/
│   │   ├── LoginScreen.jsx    ← Supabase email/password login + teacher PIN fallback
│   │   ├── PlanningStudio/    ← AI lesson planning tools (teacher-only)
│   │   ├── shared/
│   │   ├── student/
│   │   └── teacher/
│   ├── data/                  ← seed data (still used for assignments/materials until Priority 4 done)
│   ├── hooks/
│   ├── lib/
│   │   └── supabaseClient.js  ← single Supabase client export
│   ├── styles/
│   ├── App.jsx                ← Supabase session management + role routing
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env                       ← VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ANTHROPIC_API_KEY (never commit)
├── package.json
└── vite.config.js
```

---

## Current Status (Phase 1 — COMPLETE ✅)

All of the following are built and working on localhost:

- Student login (Supabase email/password)
- Concepts introduction screen
- Flipped material viewer (video, audio, reading, web embed)
- Day's assignment with 3 question types (multiple choice, short answer, reflection)
- Copy-paste prevention (CSS + JS)
- School hours gating (7:30 AM – 2:30 PM)
- AI Tutor (bilingual, guided — does NOT give away answers, has usage limits)
- Teacher dashboard (basic)
- Material scheduler
- Assignment builder
- Student responses viewer
- Express proxy server for Anthropic API
- Planning Studio (AI lesson plan / rubric / test spec generator)
- Supabase auth with role detection (teacher vs student by email)
- Supabase database schema (profiles, assignments, materials, student_responses)

---

## Pending Work — Prioritized

### ✅ PRIORITY 3 — Authentication (COMPLETE)

Supabase email/password auth is live. Key details:
- `src/lib/supabaseClient.js` — single client, reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `src/components/LoginScreen.jsx` — email + password form; teacher fallback PIN `2026` for `de142118@miescuela.pr`
- `src/App.jsx` — `getSession()` + `onAuthStateChange()` for session persistence; `authLoading` guard prevents login flash on refresh
- Role detection: `de142118@miescuela.pr` → teacher, all others → student
- Auto-profile creation on signup via `handle_new_user` trigger in Supabase

**Supabase project:** `https://dtvvecquuxmmkvkqauhe.supabase.co`

---

### 🔴 PRIORITY 4 — Supabase Data Persistence

Replace hardcoded seed data with real Supabase reads/writes. The database schema already exists (migration applied). Connect the app to it.

**What needs to be wired up:**

#### 1. Student Submit → save to `student_responses`

In `src/components/student/AssignmentView.jsx`, the submit button currently just sets `isSubmitted = true` locally. It needs to call Supabase on submit:

```js
import { supabase } from "../../lib/supabaseClient";

// Inside the submit handler (where setIsSubmitted(true) currently is):
const { data: { session } } = await supabase.auth.getSession();
const { error } = await supabase
  .from("student_responses")
  .upsert({
    student_id: session.user.id,
    assignment_id: assignment.id,
    answers,          // the existing `answers` state object
    submitted_at: new Date().toISOString(),
  });
if (!error) setIsSubmitted(true);
```

#### 2. Teacher Responses tab → read from `student_responses`

In `src/components/teacher/Responses.jsx`, responses are currently read from the `roster` prop (local state). Replace with a Supabase query:

```js
import { supabase } from "../../lib/supabaseClient";

// On mount, fetch all responses for the active assignment:
const { data } = await supabase
  .from("student_responses")
  .select("*, profiles(full_name, avatar_initials)")
  .order("submitted_at", { ascending: false });
```

**Do not yet migrate:** assignments and materials seed data — those can stay as local state until a later sprint. Only wire up the two student_responses flows above.

---

### 🔴 PRIORITY 5 — Vercel Deployment

Deploy the app to Vercel so students and the teacher can access it from any device.

**Tasks:**

1. **Connect GitHub repo to Vercel**
   - Go to vercel.com → New Project → import `CarlosAOlivera/esl-portal`
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Add environment variables in Vercel dashboard:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ANTHROPIC_API_KEY`

3. **Convert Express proxy to Vercel Serverless Function**

   The current `server.js` Express proxy cannot run on Vercel. Create `api/anthropic.js` as a Vercel serverless function:

   ```js
   // api/anthropic.js
   export default async function handler(req, res) {
     if (req.method === "OPTIONS") {
       res.setHeader("Access-Control-Allow-Origin", "*");
       res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
       res.setHeader("Access-Control-Allow-Headers", "Content-Type");
       return res.status(204).end();
     }
     if (req.method !== "POST") return res.status(405).end();

     const response = await fetch("https://api.anthropic.com/v1/messages", {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         "x-api-key": process.env.VITE_ANTHROPIC_API_KEY,
         "anthropic-version": "2023-06-01",
       },
       body: JSON.stringify(req.body),
     });
     const data = await response.json();
     res.status(response.status).json(data);
   }
   ```

4. **Update API call base URL** in the frontend

   Currently the AI Tutor and Planning Studio call `http://localhost:3001/api/anthropic`. This needs to become `/api/anthropic` (relative URL) so it works on both localhost (via Vercel CLI or the proxy) and in production.

   Files to update:
   - `src/hooks/useTutor.js` — change the fetch URL
   - `src/components/PlanningStudio/PlanningStudio.jsx` — change the fetch URL

5. **Add `vercel.json`** for SPA routing:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

---

### 🟡 PRIORITY 6 — UI Refinement

- Tailwind CSS migration (replace current CSS files)
- Mobile optimization (students may use phones)
- Full English UI audit (standardize any remaining Spanish labels)

---

## Design System

The app uses a dark navy theme. Maintain consistency:

```css
--navy: #0A1628;
--navy-mid: #112040;
--navy-light: #1A3060;
--gold: #E8A020;
--gold-light: #F5C060;
--teal: #00B4A0;
--teal-light: #00D4BC;
--rose: #E84060;
--slate: #6080A0;
--white: #F8FAFC;
```

---

## Important Rules

1. **Never commit `.env`** — it contains Supabase and Anthropic API keys
2. **Student role vs Teacher role** — always check role before rendering teacher-only components
3. **AI Tutor must never give direct answers** — it guides, asks questions, gives hints only
4. **School hours gating** — assignments and the tutor are only accessible 7:30 AM – 2:30 PM (Puerto Rico time, UTC-4)
5. **Anti-copy measures** — maintain CSS `user-select: none` and the paste event prevention on assignment inputs
6. **Bilingual support** — AI Tutor responds in the same language the student writes in (English or Spanish)
7. **DE alignment** — all curriculum references must align to the PR Department of Education Grade 12 ESL Pacing Calendar (6 units, 38 weeks)

---

## How to Run Locally

```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — API Proxy (dev only; replaced by Vercel function in production)
node server.js

# App runs at: http://localhost:5173
# Proxy runs at: http://localhost:3001
```

---

## Multi-Agent Workflow (Claude Code)

Four specialized agents live in `.claude/agents/`. Always start with `lead-agent` for any non-trivial feature or fix.

| Agent | File | Responsibility |
|---|---|---|
| `lead-agent` | `.claude/agents/lead-agent.md` | Coordinates the team, writes `TASKS.md`, blocks deploys on QA failure |
| `backend-agent` | `.claude/agents/backend-agent.md` | Supabase schema, RLS, migrations, Vercel serverless functions |
| `frontend-agent` | `.claude/agents/frontend-agent.md` | React components, hooks, design system, role gating |
| `qa-agent` | `.claude/agents/qa-agent.md` | Vitest + RTL tests in `/tests/`; reports failures before deploy |

### Standard cycle

```
lead-agent   → analyzes request → writes tasks to TASKS.md
                ├─ backend-agent  → publishes API contract → implements
                ├─ frontend-agent → waits for contract → builds UI
                └─ qa-agent       → runs tests → blocks deploy on failure → reports to responsible agent
lead-agent   → reviews outputs → closes cycle
```

### How to invoke

```bash
# Start any new feature here:
claude --agent lead-agent "describe the feature or bug"

# Or target a specific agent when the task is already scoped:
claude --agent backend-agent  "TASK-NNN: ..."
claude --agent frontend-agent "TASK-NNN: ..."
claude --agent qa-agent       "TASK-NNN: write and run tests for ..."
```

### Shared task file

`TASKS.md` (repo root) is the source of truth for task status. Every agent reads and updates it. Format:

```
## [TASK-NNN] Title
- **Agent**: backend | frontend | qa
- **Status**: pending | in-progress | done | blocked
- **Description**: ...
- **Acceptance criteria**: ...
- **Depends on**: TASK-NNN (if any)
```

---

## Contact & Context

- **Teacher/Developer:** Prof. Carlos Olivera
- **School:** Escuela Superior Fernando Suria Chaves, Barceloneta, PR
- **Email:** de142118@miescuela.pr
- **Project name:** Project ELEVATE
- **App goes live:** August 2026 (first day of school year 2026–2027)
- **Target users:** ~30 Grade 12 ESL students + 1 teacher
- **Scale plan:** After piloting at Fernando Suria Chaves, expand to other PR schools and eventually districts in FL, TX, NY, CA with high ELL populations

---

## Brand Identity — Project ELEVATE

### Visual identity

- **Wordmark:** "ELEVATE" in bold white sans-serif. The letter **A** is replaced by a stylized mountain peak.
- **Icon mark (app icon / favicon):** the mountain-peak "A" in isolation, no text. Used for small-format placements.
- **Signature details:**
  - A 4-point gold/yellow star sits at the apex of the peak (achievement, AI "spark").
  - A small light-blue diamond sits at the base of the peak (interior negative space).
- **Tagline:** `LEARN • GROW • ACHIEVE` (small caps, tracked out, used under the wordmark).

### Color tokens

| Token | Role | Approx. value |
|---|---|---|
| `--navy-deep` | App/page background | near-black navy |
| `--navy` | Panel / card background | deep navy blue |
| `--blue-bright` | Primary accent, CTAs | saturated blue |
| `--blue-light` | Secondary accent, highlights | bright sky blue |
| `--gold` | Achievement accents, stars, badges | warm gold/yellow |
| `--ink` | Primary text on dark backgrounds | near-white |
| `--ink-dim` | Secondary/muted text | soft blue-gray |

The peak/icon and most brand elements use a **blue gradient** (`--blue-light` → `--blue-bright`); gold is reserved for accents that signal achievement or highlight (the star, badges, the "PRACTICE" mode pill).

### Usage notes

- Full wordmark + tagline → teacher-facing surfaces (Planning Studio header, login screen, printed/PDF exports, syllabus materials).
- Icon-only mark → favicon, app icon, anywhere space is tight.
- Keep the institutional brand (ELEVATE) visually separate from Eli (see below) — Eli is a feature-level persona, not a brand replacement.

---

## AI Tutor Persona — "Eli"

Eli is the dedicated avatar/persona for the **AI Tutor feature inside the student-facing portal only**. It is not the project mascot and does not appear in teacher-facing surfaces or institutional materials.

- **Design:** white-and-blue 3D robot character, friendly rounded features, glowing blue "screen" eyes, small cape detail, a heart icon on one hand, an "E" marking on the ear/side panel.
- **Purpose:** lowers the affective barrier for 12th-grade ESL students practicing English with an AI — friendlier and less intimidating than a generic chatbot, while the surrounding UI stays visually mature (dark navy + blue/gold ELEVATE palette) so the experience doesn't read as a "kids' app."
- **UI pattern (see reference mockup):**
  - Eli's avatar appears in a small circular frame with a conic blue/gold gradient ring, in the tutor header and next to each of Eli's chat bubbles.
  - Eli's messages use a dark navy bubble with a subtle blue border.
  - Student messages use a solid navy bubble, right-aligned.
  - A distinct **"GUIDED MODE" bubble style** (gold-tinted border/background, small gold tag label) is used whenever Eli redirects a student away from a direct-answer request — this is the visual signal for the anti-cheating/guardrail behavior already defined for the tutor (Eli asks a guiding question instead of giving the answer).
  - A three-dot typing indicator (animated, blue dots) appears next to Eli's avatar while a response is generating.
  - Input bar: rounded pill input + circular gradient send button, consistent with the blue brand gradient.
- **Tone of voice:** warm, encouraging, conversational English; never gives direct answers to assessed questions; always responds with a guiding question or hint when a student asks for "the answer."

**Reference asset:** `eli_tutor_mockup.html` (chat UI mockup demonstrating header, message bubbles, guided-mode response, typing state, and input bar) — use as the visual reference when building the real AI Tutor component.
