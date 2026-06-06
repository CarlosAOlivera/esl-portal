// mockData.js — Seed data and utility functions for the ESL portal.
// Curriculum content is aligned to the PR Department of Education
// Grade 12 ESL Pacing Calendar (2026–2027 school year).
//
// Units:
//   12.1 My Journey So Far         — 6 weeks  (Aug wks 2–7)
//   12.2 Walking into the Future   — 7 weeks  (Sep–Oct wks 8–15)
//   12.3 Poetic Justice            — 6 weeks  (Oct–Nov wks 15–20)
//   12.4 Then and Now              — 7 weeks  (Jan wks 24–30)
//   12.5 See It My Way             — 6 weeks  (Mar–Apr wks 31–36)
//   12.6 The Long and Short of It  — 6 weeks  (Apr–May wks 37–42)

// ── Feature flags ─────────────────────────────────────────────────────────────

// Set to false in production to enforce real school-hours gating
export const DEMO_MODE = true;

// ── Date utilities ────────────────────────────────────────────────────────────

export const todayStr = () => new Date().toISOString().slice(0, 10);

export const daysFrom = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const fmtDate = (isoDate) => {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const daysUntil = (isoDate) => {
  if (!isoDate) return null;
  const diff = Math.round((new Date(isoDate) - new Date(todayStr())) / 86400000);
  if (diff === 0)  return "today";
  if (diff === 1)  return "tomorrow";
  if (diff === -1) return "yesterday";
  return diff > 1 ? `in ${diff} days` : `${Math.abs(diff)} days ago`;
};

export const flippedStat = (publishDate) => {
  if (!publishDate) return "draft";
  return publishDate > todayStr() ? "scheduled" : "published";
};

export const wordCount = (text) =>
  text.trim().split(/\s+/).filter((w) => w.length > 0).length;

export const fmtTimer = (totalSeconds) =>
  `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;

// ── Content type config ───────────────────────────────────────────────────────

export const CONTENT_TYPES = {
  video: {
    icon: "🎬",
    label: "Video",
    color: "#f59e0b",
    urlLabel: "Video URL (YouTube, Teams)",
    ph: "https://youtube.com/watch?v=...",
  },
  podcast: {
    icon: "🎙",
    label: "Podcast",
    color: "#22d3ee",
    urlLabel: "Audio URL (NotebookLM)",
    ph: "https://notebooklm.google.com/...",
  },
  pdf: {
    icon: "📄",
    label: "PDF",
    color: "#f87171",
    urlLabel: "PDF URL (Google Drive / OneDrive)",
    ph: "https://drive.google.com/...",
  },
  website: {
    icon: "🌐",
    label: "Website",
    color: "#34d399",
    urlLabel: "Website URL",
    ph: "https://...",
  },
};

// ── Status badge config ───────────────────────────────────────────────────────

export const STATUS_CONFIG = {
  published: { bg: "rgba(52,211,153,0.13)",  color: "#34d399",             label: "● Published" },
  scheduled: { bg: "rgba(99,102,241,0.13)",  color: "#a78bfa",             label: "◷ Scheduled" },
  draft:     { bg: "rgba(148,163,184,0.1)",  color: "rgba(148,163,184,0.5)", label: "○ Draft"   },
};

// ── Seed class roster (teacher dashboard — will be replaced by Supabase data) ─

export const INITIAL_ROSTER = [
  { id: 1,  name: "María González",   avatarInitials: "MG", submitted: true,  reviewed: false, tutorMinutes: 12, tutorMessages: 18, pasteAttempts: 0 },
  { id: 2,  name: "Carlos Pérez",     avatarInitials: "CP", submitted: true,  reviewed: true,  tutorMinutes: 31, tutorMessages: 24, pasteAttempts: 3 },
  { id: 3,  name: "Gabriela Torres",  avatarInitials: "GT", submitted: true,  reviewed: false, tutorMinutes: 7,  tutorMessages: 9,  pasteAttempts: 0 },
  { id: 4,  name: "José Rivera",      avatarInitials: "JR", submitted: false, reviewed: false, tutorMinutes: 0,  tutorMessages: 0,  pasteAttempts: 0 },
  { id: 5,  name: "Sofía Martínez",   avatarInitials: "SM", submitted: true,  reviewed: false, tutorMinutes: 22, tutorMessages: 19, pasteAttempts: 1 },
  { id: 6,  name: "Andrés López",     avatarInitials: "AL", submitted: false, reviewed: false, tutorMinutes: 4,  tutorMessages: 6,  pasteAttempts: 7 },
  { id: 7,  name: "Valeria Cruz",     avatarInitials: "VC", submitted: true,  reviewed: true,  tutorMinutes: 38, tutorMessages: 28, pasteAttempts: 0 },
  { id: 8,  name: "Miguel Hernández", avatarInitials: "MH", submitted: true,  reviewed: false, tutorMinutes: 15, tutorMessages: 12, pasteAttempts: 2 },
  { id: 9,  name: "Isabella Díaz",    avatarInitials: "ID", submitted: false, reviewed: false, tutorMinutes: 0,  tutorMessages: 0,  pasteAttempts: 0 },
  { id: 10, name: "Daniel Morales",   avatarInitials: "DM", submitted: true,  reviewed: false, tutorMinutes: 9,  tutorMessages: 11, pasteAttempts: 0 },
];

// ── Unit 12.1 — My Journey So Far ────────────────────────────────────────────
// PR DE Pacing Calendar: Weeks 2–7 (August–September 2026)
// Essential Questions:
//   EQ1. How do personal journeys shape society and culture?
//   EQ2. How are people shaped by their journeys and experiences?
//   EQ3. How do authors use literal and symbolic journeys to structure stories?
// Key skills: Reading biographies & personal narratives, writing reflective
//             narratives, chronological order, flashback/flash-forward.

export const INITIAL_CONCEPTS = {
  unit: "Unit 12.1 · Week 1",
  title: "My Journey So Far",
  overview:
    "In this unit we explore personal narratives and biographies — stories of real journeys that shape who we are. Today you will learn the three key literary tools writers use to organize and tell their stories.",
  keyQuestion:
    "As you read and write today, ask yourself: How does the author's personal journey shape who they are — and what does your own journey say about you?",
  concepts: [
    {
      term: "Personal Narrative",
      pronunciation: "/ˈpɜːrsənəl ˈnærətɪv/",
      color: "#f59e0b",
      icon: "✍️",
      definition:
        "A first-person account of real events from the writer's own life. The writer shares personal experiences, thoughts, and feelings to connect with the reader.",
      example:
        '"Last summer, packing everything I owned into two suitcases, I finally understood what my grandmother meant when she said home is not a place — it is the people you carry with you."',
    },
    {
      term: "Chronological Order",
      pronunciation: "/ˌkrɒnəˈlɒdʒɪkəl ˈɔːrdər/",
      color: "#22d3ee",
      icon: "📅",
      definition:
        "Organizing events in the sequence they happened in time — from earliest to most recent. This is the most common structure in narratives and helps readers follow the story clearly.",
      example:
        '"First, I applied to three universities. Then, I waited for three months. Finally, the acceptance letter arrived on a Tuesday morning I will never forget."',
    },
    {
      term: "Flashback",
      pronunciation: "/ˈflæʃbæk/",
      color: "#a78bfa",
      icon: "⏪",
      definition:
        "A narrative technique that interrupts the present story to take the reader back to an earlier event. Authors use flashbacks to explain a character's motivations, reveal backstory, or create emotional depth.",
      example:
        '"Standing at the graduation stage, I suddenly remembered being seven years old, telling my father I wanted to be a doctor. His smile that day gave me the courage to keep going."',
    },
  ],
};

// ── Unit 12.1 flipped classroom materials ────────────────────────────────────

export const INITIAL_FLIPPED = [
  {
    id: "f1",
    type: "video",
    title: "What Is a Personal Narrative? — Introduction",
    unit: "Unit 12.1 · Week 1",
    url: "https://www.youtube.com/embed/5gvFiDxDSBs",
    description:
      "Watch this video before class. It introduces personal narratives and explains how real writers share their life experiences. Pay attention to the examples given and think about a journey from your own life.",
    publishDate: daysFrom(-1),
    assignmentId: "a1",
  },
  {
    id: "f2",
    type: "website",
    title: "Purdue OWL — Narrative Essays",
    unit: "Unit 12.1 · Week 1",
    url: "https://owl.purdue.edu/owl/general_writing/academic_writing/essay_writing/narrative_essays.html",
    description:
      "Read this guide on narrative writing. Focus on the section about structure and point of view. Take notes on at least two techniques you want to try in your own writing.",
    publishDate: daysFrom(-1),
    assignmentId: "a1",
  },
  {
    id: "f3",
    type: "video",
    title: "Chronological Order vs. Flashback — Literary Techniques",
    unit: "Unit 12.1 · Week 2",
    url: "",
    description:
      "Watch this video on how authors organize narratives. Compare chronological order and flashback, and find one example of each technique in something you have read recently.",
    publishDate: daysFrom(3),
    assignmentId: "a2",
  },
  {
    id: "f4",
    type: "pdf",
    title: "excerpt — 'When I Was Puerto Rican' by Esmeralda Santiago",
    unit: "Unit 12.1 · Week 2",
    url: "https://drive.google.com/file/d/1IoQq6wWWeJryilLFfRPsQ1gNOj4veaIU/view",
    description:
      "Read the assigned pages. As you read, underline at least one example of a flashback and mark any words or phrases that help you understand the sequence of events.",
    publishDate: daysFrom(3),
    assignmentId: "a2",
  },
  {
    id: "f5",
    type: "podcast",
    title: "Storytelling & Identity — NotebookLM Discussion",
    unit: "Unit 12.1 · Week 3",
    url: "",
    description:
      "Listen to this podcast about how Puerto Rican writers use personal narrative to explore identity and culture. Listen for how each author's journey shaped their writing voice.",
    publishDate: daysFrom(8),
    assignmentId: null,
  },
  {
    id: "f6",
    type: "video",
    title: "Writing a Reflective Personal Narrative — Step by Step",
    unit: "Unit 12.1 · Week 3",
    url: "",
    description:
      "This video walks you through the writing process for a personal narrative: brainstorming, drafting, and revising. Use it as a guide when you begin drafting your own narrative.",
    publishDate: daysFrom(10),
    assignmentId: null,
  },
];

// ── Unit 12.1 assignments ─────────────────────────────────────────────────────

export const INITIAL_ASSIGNMENTS = [
  {
    id: "a1",
    title: "Narrative Foundations — What Makes a Story",
    unit: "Unit 12.1 · Week 1",
    status: "published",
    flippedId: "f1",
    instructions:
      "Based on the video and website you reviewed at home, complete the following questions. Use complete sentences and support your answers with specific examples from the material.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        text: "According to the video, which of the following best describes the main purpose of a personal narrative?",
        options: [
          "To inform the reader about a historical event using facts and statistics",
          "To share a personal experience in a way that connects with the reader's emotions and understanding",
          "To argue a point of view and persuade the reader to agree with the writer",
          "To entertain the reader with a fictional story created from imagination",
        ],
      },
      {
        id: "q2",
        type: "short_answer",
        text: "In your own words, explain what chronological order is and why writers use it. Give one example of how an author might use chronological order in a personal narrative.",
        placeholder: "Write your answer here...",
        minWords: 30,
      },
      {
        id: "q3",
        type: "journal",
        text: "Think about a personal journey or important experience from your own life — big or small. Describe it briefly and explain how it shaped who you are today. Use the first person (I, me, my) and write with as much detail as you can.",
        placeholder: "Write your personal reflection here...",
        minWords: 60,
      },
    ],
  },
  {
    id: "a2",
    title: "Flashback & Chronological Order in Literature",
    unit: "Unit 12.1 · Week 2",
    status: "draft",
    flippedId: "f3",
    instructions:
      "Using the excerpt you read at home and the video on literary techniques, answer the following questions about how authors structure narratives.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        text: "When an author interrupts the current story to show an earlier event from a character's past, this technique is called:",
        options: [
          "Chronological order",
          "Flashback",
          "Flash-forward",
          "Foreshadowing",
        ],
      },
      {
        id: "q2",
        type: "short_answer",
        text: "Find one example of a flashback in the excerpt from 'When I Was Puerto Rican.' Copy the sentence or passage, then explain in your own words what past event the author is describing and why it is important to the story.",
        placeholder: "Write your answer here...",
        minWords: 40,
      },
      {
        id: "q3",
        type: "journal",
        text: "Esmeralda Santiago writes about her childhood in Puerto Rico as a way to understand her present self. Write a short paragraph using a flashback technique: start in the present moment, then travel back to a memory from your past that explains something about who you are today.",
        placeholder: "Write your flashback paragraph here...",
        minWords: 70,
      },
    ],
  },
  {
    id: "a3",
    title: "Building My Journey So Far — Draft Workshop",
    unit: "Unit 12.1 · Week 3",
    status: "draft",
    flippedId: null,
    instructions:
      "This is the in-class workshop session for your personal narrative draft. Use the techniques you have practiced this unit.",
    questions: [],
  },
];

// ── AI tutor system prompt ────────────────────────────────────────────────────

export const TUTOR_SYSTEM_PROMPT = (currentQuestion) =>
  `You are an ESL tutor for a 12th-grade student at Escuela Superior Fernando Suria Chaves in Barceloneta, Puerto Rico. The class is currently studying Unit 12.1: "My Journey So Far" — a unit focused on personal narratives, biographies, chronological order, and flashback techniques.

CURRENT QUESTION THE STUDENT IS WORKING ON:
"${currentQuestion?.text || "General help with the assignment"}"

YOUR RULES:
1. NEVER give the direct answer or write sentences the student can copy into their response.
2. Use the Socratic method — ask guiding questions to help them think through the answer themselves.
3. If the student is stuck, give a hint or example that points them in the right direction without completing the thought for them.
4. Give specific, constructive feedback: praise what they did well, identify what needs improvement, suggest how to improve it.
5. Help with vocabulary and grammar when needed, but always in service of helping them express their own ideas better.

LANGUAGE: Default to English. If the student writes in Spanish or asks to switch, respond in Spanish. Mixing languages (Spanglish) is fine and normal.

TONE: Warm, encouraging, patient, and supportive — like a knowledgeable friend who wants them to succeed. Never make them feel bad for not knowing something.

GOAL: Help them think, not think for them.`;
