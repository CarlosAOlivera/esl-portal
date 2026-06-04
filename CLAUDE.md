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

When tackling large tasks, use sub-agents as follows:

**For Priority 4 (Supabase data wiring):**
```
Main agent → reads this file and current AssignmentView + Responses components
  └─ Sub-agent A: wires Submit button in AssignmentView.jsx to student_responses
  └─ Sub-agent B: wires Responses.jsx to read from Supabase
```

**For Priority 5 (Vercel deployment):**
```
Main agent → reads this file and current server.js + useTutor.js
  └─ Sub-agent A: creates api/anthropic.js serverless function + vercel.json
  └─ Sub-agent B: updates fetch URLs in useTutor.js and PlanningStudio.jsx
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
