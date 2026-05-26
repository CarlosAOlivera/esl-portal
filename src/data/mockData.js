// Mock data and utility functions for the ESL portal.
// Contains: feature flags, date helpers, content-type config, status config,
// seed users, concepts, flipped items, assignments, roster, sample answers,
// and the AI tutor system prompt.

// ── Feature flags ─────────────────────────────────────────────────────────────

// Set to false in production to enforce real school-hours gating
export const DEMO_MODE = true;

// ── Date utilities ────────────────────────────────────────────────────────────

// Returns today's date as "YYYY-MM-DD"
export const todayStr = () => new Date().toISOString().slice(0, 10);

// Returns a date string offset by `offset` days from today
export const daysFrom = (offset) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + offset);
  return futureDate.toISOString().slice(0, 10);
};

// Formats an ISO date string as a short localized label (e.g. "lun., 2 jun.")
export const fmtDate = (isoDate) => {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  return new Date(year, month - 1, day).toLocaleDateString("es-PR", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// Returns a human-readable relative description ("hoy", "mañana", "en 3 días", etc.)
export const daysUntil = (isoDate) => {
  if (!isoDate) return null;
  const dayDifference = Math.round(
    (new Date(isoDate) - new Date(todayStr())) / 86400000
  );
  if (dayDifference === 0)  return "hoy";
  if (dayDifference === 1)  return "mañana";
  if (dayDifference === -1) return "ayer";
  return dayDifference > 1
    ? `en ${dayDifference} días`
    : `hace ${Math.abs(dayDifference)} días`;
};

// Returns the display status of a flipped item based on its publish date
export const flippedStat = (publishDate) => {
  if (!publishDate) return "draft";
  return publishDate > todayStr() ? "scheduled" : "published";
};

// Counts the number of meaningful words in a text string
export const wordCount = (text) =>
  text.trim().split(/\s+/).filter((word) => word.length > 0).length;

// Formats a total-seconds count as "M:SS"
export const fmtTimer = (totalSeconds) =>
  `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;

// ── Content type config ───────────────────────────────────────────────────────

// Defines icon, label, accent color, and URL field helpers for each media type
export const CONTENT_TYPES = {
  video: {
    icon: "🎬",
    label: "Video",
    color: "#f59e0b",
    urlLabel: "URL del video (YouTube, Teams)",
    ph: "https://youtube.com/watch?v=...",
  },
  podcast: {
    icon: "🎙",
    label: "Podcast",
    color: "#22d3ee",
    urlLabel: "URL del audio (NotebookLM)",
    ph: "https://notebooklm.google.com/...",
  },
  pdf: {
    icon: "📄",
    label: "PDF",
    color: "#f87171",
    urlLabel: "URL del PDF (OneDrive/SharePoint)",
    ph: "https://...",
  },
  website: {
    icon: "🌐",
    label: "Website",
    color: "#34d399",
    urlLabel: "URL del sitio web",
    ph: "https://...",
  },
};

// ── Status badge config ───────────────────────────────────────────────────────

// Maps a flipped/assignment status to its badge background, text color, and label
export const STATUS_CONFIG = {
  published: {
    bg: "rgba(52,211,153,0.13)",
    color: "#34d399",
    label: "● Publicado",
  },
  scheduled: {
    bg: "rgba(99,102,241,0.13)",
    color: "#a78bfa",
    label: "◷ Programado",
  },
  draft: {
    bg: "rgba(148,163,184,0.1)",
    color: "rgba(148,163,184,0.5)",
    label: "○ Borrador",
  },
};

// ── Seed users ────────────────────────────────────────────────────────────────

export const MOCK_USERS = {
  student: {
    name: "María González",
    email: "magonzalez@de.pr",
    avatarInitials: "MG",
    role: "student",
  },
  teacher: {
    name: "Prof. Carlos Rodríguez",
    email: "crodriguez@de.pr",
    avatarInitials: "CR",
    role: "teacher",
  },
};

// ── Seed concepts (IntroView) ─────────────────────────────────────────────────

export const INITIAL_CONCEPTS = {
  unit: "Unit 3 · Week 4",
  title: "Rhetorical Devices in Persuasive Writing",
  overview:
    "Today we apply what you learned at home about how writers and speakers convince their audience. These three tools are the foundation of all persuasive communication.",
  keyQuestion:
    "As you work today, ask yourself: which device is the speaker using — and why did they choose it in that moment?",
  concepts: [
    {
      term: "Ethos",
      pronunciation: "/ˈiːθɒs/",
      color: "#f59e0b",
      icon: "🏛️",
      definition:
        "An appeal to credibility or character. The speaker convinces the audience by demonstrating expertise, trustworthiness, or authority.",
      example:
        '"As a doctor with 20 years of experience, I can tell you that this treatment works."',
    },
    {
      term: "Pathos",
      pronunciation: "/ˈpeɪθɒs/",
      color: "#ec4899",
      icon: "❤️",
      definition:
        "An appeal to emotion. The speaker connects with the audience's feelings — fear, hope, sympathy, anger — to make the message resonate.",
      example:
        '"Think about the children who go to bed hungry every night. We can change that."',
    },
    {
      term: "Logos",
      pronunciation: "/ˈloʊɡɒs/",
      color: "#22d3ee",
      icon: "📊",
      definition:
        "An appeal to logic and reason. The speaker uses facts, statistics, and structured arguments to build a rational case.",
      example:
        '"Studies show that recycling reduces landfill waste by 40% — the numbers speak for themselves."',
    },
  ],
};

// ── Seed flipped material ─────────────────────────────────────────────────────

export const INITIAL_FLIPPED = [
  {
    id: "f1",
    type: "video",
    title: "Understanding Rhetorical Devices",
    unit: "Unit 3 · Week 4",
    url: "",
    description:
      "Watch this 12-minute video. Pay attention to how the speaker uses ethos, pathos, and logos.",
    publishDate: daysFrom(-2),
    assignmentId: "a1",
  },
  {
    id: "f2",
    type: "podcast",
    title: "Ethos, Pathos & Logos — Deep Dive Podcast",
    unit: "Unit 3 · Week 4",
    url: "",
    description:
      "Listen to this NotebookLM podcast that breaks down the three rhetorical appeals with real examples.",
    publishDate: daysFrom(-1),
    assignmentId: "a1",
  },
  {
    id: "f3",
    type: "pdf",
    title: "Persuasion in Advertising — Reading",
    unit: "Unit 3 · Week 5",
    url: "",
    description:
      "Read pages 1–8. Focus on how the author identifies rhetorical strategies in modern ads.",
    publishDate: daysFrom(1),
    assignmentId: "a2",
  },
  {
    id: "f4",
    type: "website",
    title: "Purdue OWL — Rhetorical Situations",
    unit: "Unit 3 · Week 5",
    url: "https://owl.purdue.edu",
    description:
      "Review the sections on ethos, pathos, and logos. Take notes on the examples provided.",
    publishDate: daysFrom(1),
    assignmentId: "a2",
  },
  {
    id: "f5",
    type: "video",
    title: "Counterarguments & Rebuttals",
    unit: "Unit 3 · Week 6",
    url: "",
    description:
      "Learn how strong writers acknowledge opposing views and then rebut them effectively.",
    publishDate: daysFrom(4),
    assignmentId: null,
  },
];

// ── Seed assignments ──────────────────────────────────────────────────────────

export const INITIAL_ASSIGNMENTS = [
  {
    id: "a1",
    title: "Persuasive Devices in Action",
    unit: "Unit 3 · Week 4",
    status: "published",
    flippedId: "f1",
    instructions:
      "Based on the video you watched at home, complete the following questions. Use complete sentences and support your answers with evidence from the video.",
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        text: "Which rhetorical device does the speaker primarily use in the opening 2 minutes of the video?",
        options: [
          "Ethos — establishing credibility",
          "Pathos — appealing to emotions",
          "Logos — using logic and data",
          "Kairos — timing the argument",
        ],
      },
      {
        id: "q2",
        type: "short_answer",
        text: "In your own words, explain the difference between ethos and pathos. Give one example of each from the video.",
        placeholder: "Write your answer here...",
        minWords: 30,
      },
      {
        id: "q3",
        type: "journal",
        text: "Reflect on a time when someone tried to persuade you using one of these rhetorical devices. What device did they use? Was it effective? Why or why not?",
        placeholder: "Write your reflection here...",
        minWords: 50,
      },
    ],
  },
  {
    id: "a2",
    title: "Building a Logical Argument",
    unit: "Unit 3 · Week 5",
    status: "draft",
    flippedId: "f3",
    instructions:
      "Using the CER framework from the video, construct a short argument about a topic of your choice.",
    questions: [],
  },
];

// ── Seed class roster ─────────────────────────────────────────────────────────

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

// ── Sample student answers (shown in Responses view) ─────────────────────────

export const MOCK_ANSWERS = [
  {
    question: "P1 · Selección múltiple",
    response: "Ethos — establishing credibility",
  },
  {
    question: "P2 · Short answer",
    response:
      "Ethos tries to make the audience believe what the speaker says based on their credentials. In the video, the speaker mentioned their background to gain trust. Pathos was used when they described emotional stories about families to connect with listeners.",
  },
  {
    question: "P3 · Journal",
    response:
      "I remember when my teacher tried to convince our class to read more books. She used pathos by telling us stories about students who struggled later in life. It was effective because it made us feel worried about our future and motivated to change our habits.",
  },
];

// ── AI tutor system prompt ────────────────────────────────────────────────────

// Generates the system prompt sent to Claude for each tutor session.
// The prompt keeps the AI in a Socratic mode — guiding without giving answers.
export const TUTOR_SYSTEM_PROMPT = (currentQuestion) =>
  `You are an ESL tutor for a 12th-grade student in Puerto Rico.
CURRENT QUESTION: "${currentQuestion?.text || "General help"}"
RULES: Help students THINK — never give the direct answer. Never write sentences they can copy. Give feedback: praise strengths, guide improvement. Explain vocabulary/grammar when needed.
LANGUAGE: Default English. If student writes in Spanish or asks, switch to Spanish. Mixing both languages is fine.
TONE: Encouraging, patient, supportive. Your goal is to help them think, not think for them.`;
