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
| Auth (target) | Microsoft Entra ID (MSAL) |
| Data (target) | SharePoint via Microsoft Graph API |
| Deploy (target) | Azure Static Web Apps |
| Repo | github.com/CarlosAOlivera/esl-portal |

---

## Repository Structure

```
esl-portal/
├── CLAUDE.md                  ← this file
├── public/
├── server.js                  ← Express proxy for Anthropic API (handles CORS)
├── src/
│   ├── assets/
│   ├── components/            ← all React components live here
│   ├── data/                  ← seed data (assignments, materials, questions)
│   ├── hooks/                 ← custom React hooks
│   ├── styles/                ← global styles
│   ├── App.jsx                ← main router/layout
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env                       ← VITE_ANTHROPIC_API_KEY (never commit)
├── package.json
└── vite.config.js
```

---

## Current Status (Phase 1 — COMPLETE ✅)

All of the following are built and working on localhost:

- Student login (demo mode)
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

---

## Pending Work — Prioritized

### 🔴 PRIORITY 1 — Integrate Planning Studio

The Planning Studio exists as a standalone React artifact but has NOT been integrated into the app. It must be added as a new section in the Teacher Dashboard.

**What Planning Studio does:**
- Generates lesson plans, rubrics, test specs, exit tickets, and scaffold/graphic organizers
- Uses Claude API to generate content based on: selected unit (from DE Pacing Calendar), skill focus (Reading/Writing/Listening/Speaking/Language), proficiency level, and free-form context
- Renders a PDF-printable output the teacher can share with the school principal
- Has session history (last 8 generated documents)

**Integration tasks:**
1. Create `src/components/PlanningStudio/` folder with:
   - `PlanningStudio.jsx` — main component
   - `PlanningStudio.css` — styles
   - `DocumentPreview.jsx` — rendered output with print/PDF button
   - `SessionHistory.jsx` — sidebar with last 8 docs
2. Add a "Planning" tab/route in `App.jsx` (teacher-only, not visible to students)
3. Wire API calls through existing `server.js` proxy (same pattern as AI Tutor)
4. PDF export: use `window.print()` with a print-specific CSS that hides the nav and shows only the document with school header and teacher name

**Units to pre-load (DE Pacing Calendar Grade 12):**
- Unit 1: Identity & Community (Weeks 1–6)
- Unit 2: Technology & Society (Weeks 7–13)
- Unit 3: Environmental Challenges (Weeks 14–20)
- Unit 4: Career & Future Goals (Weeks 21–26)
- Unit 5: Global Citizenship (Weeks 27–32)
- Unit 6: The Long and Short of It — Literary Elements (Weeks 33–38)

**Teacher info for PDF header:**
- Teacher: Prof. Carlos Olivera
- School: Escuela Superior Fernando Suria Chaves
- Location: Barceloneta, Puerto Rico
- Curriculum: PR Department of Education · Grade 12 ESL

---

### 🔴 PRIORITY 2 — Fix Assignment Submit Bug

The "Submit" (Entregar) button was not activating correctly. Investigate and fix.

Likely location: `src/components/` — look for the assignment or student view component.

**Expected behavior:** Button becomes active only when all required questions have a response. On click, locks the form, shows confirmation, and saves the response object.

---

### 🟡 PRIORITY 3 — Microsoft Entra ID Authentication

Replace the current demo login with real Microsoft authentication using MSAL.

**Context:**
- Students and teachers authenticate with their Puerto Rico DE Microsoft accounts
- Student emails follow the pattern: `[student]@miescuela.pr`
- Teacher email: `de142118@miescuela.pr`
- The DE uses Microsoft 365 — Teams, OneDrive, SharePoint are all active

**Tasks:**
1. Install `@azure/msal-react` and `@azure/msal-browser`
2. Create `src/auth/msalConfig.js` with Entra ID app registration config
3. Wrap `main.jsx` with `MsalProvider`
4. Replace demo login screen with Microsoft SSO button
5. Extract user role from Microsoft account (teacher vs student) — use email domain or a group membership check
6. Add fallback: if Entra auth fails, allow teacher login with `de142118@miescuela.pr` + PIN for demo/testing

**Note:** The Azure app registration (client ID, tenant ID) will need to be created in the DE's Azure portal. Use environment variables: `VITE_AZURE_CLIENT_ID`, `VITE_AZURE_TENANT_ID`. Leave placeholders if the registration isn't ready yet — build the implementation so it works once the IDs are provided.

---

### 🟡 PRIORITY 4 — SharePoint Data Persistence

Replace all hardcoded seed data with real SharePoint storage via Microsoft Graph API.

**What needs to move to SharePoint:**
- Student assignment responses → SharePoint List: `StudentResponses`
- Assignments and questions → SharePoint List: `Assignments`
- Flipped materials (links, descriptions) → SharePoint List: `FlippedMaterials`
- AI Tutor usage logs → SharePoint List: `TutorLogs`

**Tasks:**
1. Create `src/services/graphService.js` — all Graph API calls go here
2. Add Microsoft Graph scope to MSAL config: `Sites.ReadWrite.All` or `Lists.ReadWrite`
3. Functions needed:
   - `saveStudentResponse(assignmentId, studentId, responses)`
   - `getAssignments()`
   - `getMaterials(weekNumber)`
   - `getResponsesByAssignment(assignmentId)`
4. Teacher dashboard reads responses from SharePoint, not local state
5. Keep local state as cache — always sync to SharePoint on save

---

### 🟡 PRIORITY 5 — Azure Static Web Apps Deployment

Deploy the app so students and the teacher can access it from any device.

**Tasks:**
1. Configure `staticwebapp.config.json` for SPA routing
2. Set up GitHub Actions workflow for CI/CD (auto-deploy on push to `main`)
3. Configure environment variables in Azure portal:
   - `VITE_ANTHROPIC_API_KEY`
   - `VITE_AZURE_CLIENT_ID`
   - `VITE_AZURE_TENANT_ID`
4. The Express `server.js` proxy needs to become an Azure Function (or use Azure API Management) — it cannot run as a Node server in Static Web Apps
5. Move the Anthropic proxy to `api/anthropic/index.js` as an Azure Function

---

### ⬜ PRIORITY 6 — UI Refinement

- Tailwind CSS migration (replace current CSS files)
- Full English UI (some labels still in Spanish — standardize)
- Mobile optimization (students may use phones)
- Full-width layout fix

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

1. **Never commit `.env`** — it contains the Anthropic API key
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

# Terminal 2 — API Proxy
node server.js

# App runs at: http://localhost:5173
# Proxy runs at: http://localhost:3001
```

---

## Multi-Agent Workflow (Claude Code)

When tackling large tasks, use sub-agents as follows:

**For Planning Studio integration:**
```
Main agent → reads this file and existing App.jsx
  └─ Sub-agent A: builds PlanningStudio.jsx component
  └─ Sub-agent B: builds DocumentPreview.jsx + print CSS
  └─ Sub-agent C: wires routing in App.jsx + server.js proxy endpoint
```

**For Microsoft integration:**
```
Main agent → reads this file and current auth/data flow
  └─ Sub-agent A: MSAL setup (msalConfig, MsalProvider, login screen)
  └─ Sub-agent B: graphService.js (all Graph API calls)
  └─ Sub-agent C: updates Teacher Dashboard to read from SharePoint
```

**For Azure deployment:**
```
Main agent → reads this file and package.json
  └─ Sub-agent A: converts server.js to Azure Function
  └─ Sub-agent B: staticwebapp.config.json + GitHub Actions workflow
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
