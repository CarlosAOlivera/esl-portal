// mockData.js — Seed data and utility functions for the ESL portal.
// Curriculum content aligned to PR Department of Education Grade 12 ESL
// Pacing Calendar 2026–2027.

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
    weekday: "short", month: "short", day: "numeric",
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
  video:   { icon: "🎬", label: "Video",   color: "#f59e0b", urlLabel: "Video URL (YouTube, Teams)",     ph: "https://youtube.com/watch?v=..." },
  podcast: { icon: "🎙", label: "Podcast", color: "#22d3ee", urlLabel: "Audio URL (NotebookLM)",          ph: "https://notebooklm.google.com/..." },
  pdf:     { icon: "📄", label: "PDF",     color: "#f87171", urlLabel: "PDF URL (Google Drive / OneDrive)", ph: "https://drive.google.com/..." },
  website: { icon: "🌐", label: "Website", color: "#34d399", urlLabel: "Website URL",                     ph: "https://..." },
};

// ── Status badge config ───────────────────────────────────────────────────────
export const STATUS_CONFIG = {
  published: { bg: "rgba(52,211,153,0.13)",  color: "#34d399",              label: "● Published" },
  scheduled: { bg: "rgba(99,102,241,0.13)",  color: "#a78bfa",              label: "◷ Scheduled" },
  draft:     { bg: "rgba(148,163,184,0.1)",  color: "rgba(148,163,184,0.5)", label: "○ Draft"    },
};

// ── School calendar ───────────────────────────────────────────────────────────
// School year 2026–2027 starts Monday, August 3, 2026.
// Week number is calculated from that anchor date.
// Returns 0 during summer, 1 on first week, etc.

const SCHOOL_YEAR_START = new Date("2026-08-03"); // First Monday of August 2026

export function currentSchoolWeek() {
  const today   = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const diff    = today - SCHOOL_YEAR_START;
  if (diff < 0) return 0; // summer before school year
  return Math.floor(diff / msPerWeek) + 1;
}

// ── All 6 units — concept data ────────────────────────────────────────────────
// Each unit covers: unit label, title, overview, keyQuestion, and concept cards.
// Aligned to the PR DE Pacing Calendar and the official unit guides.

const UNITS_CONCEPTS = {

  // ── Unit 12.1 My Journey So Far ──────────────────────────────────────────
  // Weeks 2–7 (Aug 10 – Sep 11, 2026)
  1: {
    unit: "Unit 12.1 · Weeks 2–7",
    title: "My Journey So Far",
    overview:
      "In this unit we explore personal narratives and biographies — stories of real journeys that shape who we are. You will learn the key literary tools writers use to organize and tell their stories.",
    keyQuestion:
      "How does the author's personal journey shape who they are — and what does your own journey say about you?",
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
          "Organizing events in the sequence they happened in time — from earliest to most recent. The most common structure in narratives.",
        example:
          '"First, I applied to three universities. Then, I waited for three months. Finally, the acceptance letter arrived on a Tuesday morning I will never forget."',
      },
      {
        term: "Flashback",
        pronunciation: "/ˈflæʃbæk/",
        color: "#a78bfa",
        icon: "⏪",
        definition:
          "A narrative technique that interrupts the present story to take the reader back to an earlier event, revealing backstory or emotional depth.",
        example:
          '"Standing at the graduation stage, I suddenly remembered being seven years old, telling my father I wanted to be a doctor."',
      },
    ],
  },

  // ── Unit 12.2 Walking into the Future ────────────────────────────────────
  // Weeks 8–15 (Sep 14 – Oct 30, 2026)
  2: {
    unit: "Unit 12.2 · Weeks 8–15",
    title: "Walking into the Future",
    overview:
      "In this unit we explore research writing and career preparation. You will learn how to find reliable sources, construct a well-supported argument, and communicate professionally in spoken and written English.",
    keyQuestion:
      "How do the choices you make today shape the future you will walk into?",
    concepts: [
      {
        term: "Research",
        pronunciation: "/rɪˈsɜːrtʃ/",
        color: "#f59e0b",
        icon: "🔍",
        definition:
          "The systematic investigation of a topic using credible sources to gather information, analyze it, and draw informed conclusions.",
        example:
          '"Before writing my essay, I researched three peer-reviewed articles and two government reports to support my argument about climate policy."',
      },
      {
        term: "Thesis Statement",
        pronunciation: "/ˈθiːsɪs ˈsteɪtmənt/",
        color: "#34d399",
        icon: "📌",
        definition:
          "A one or two-sentence statement that clearly expresses the main argument or central point of a paper. It tells the reader what to expect.",
        example:
          '"Expanding access to bilingual education in Puerto Rico will improve academic outcomes and preserve cultural identity for future generations."',
      },
      {
        term: "Formal vs. Informal Language",
        pronunciation: "/ˈfɔːrməl vɜːrsəs ɪnˈfɔːrməl/",
        color: "#60a5fa",
        icon: "💬",
        definition:
          "Formal language uses complete sentences, standard grammar, and professional vocabulary. Informal language is casual, uses contractions, and is appropriate for friends.",
        example:
          'Formal: "I would like to inquire about the position." Informal: "Hey, I wanna know about the job."',
      },
    ],
  },

  // ── Unit 12.3 Poetic Justice ─────────────────────────────────────────────
  // Weeks 15–20 (Oct 27 – Nov 20, 2026)
  3: {
    unit: "Unit 12.3 · Weeks 15–20",
    title: "Poetic Justice",
    overview:
      "In this unit we explore poetry and drama as tools for social expression. You will study Puerto Rican poets and playwrights, analyze how word choice creates meaning, and write and perform your own original poems.",
    keyQuestion:
      "How do poetry and drama help us better understand ourselves and the world — and what message do YOU want to send?",
    concepts: [
      {
        term: "Poetic Devices",
        pronunciation: "/poʊˈɛtɪk dɪˈvaɪsɪz/",
        color: "#ec4899",
        icon: "🌸",
        definition:
          "Literary tools that poets use to create effect: rhyme, rhythm, metaphor, simile, alliteration, imagery, and personification.",
        example:
          '"The road was a ribbon of moonlight" uses metaphor. "The wind whispered" uses personification.',
      },
      {
        term: "Tone and Mood",
        pronunciation: "/toʊn ænd muːd/",
        color: "#a78bfa",
        icon: "🎭",
        definition:
          "Tone is the author's attitude toward the subject (e.g., angry, hopeful, ironic). Mood is the feeling the reader experiences while reading the poem or play.",
        example:
          '"The tone of Lorca\'s poem is mournful and heavy. The mood it creates in the reader is one of sadness and longing."',
      },
      {
        term: "Social Justice",
        pronunciation: "/ˈsoʊʃəl ˈdʒʌstɪs/",
        color: "#f59e0b",
        icon: "✊",
        definition:
          "The fair and equal distribution of opportunities, rights, and resources in society. Many poets and playwrights use their art to advocate for justice.",
        example:
          '"Julia de Burgos used poetry as a tool of social justice, challenging gender inequality and colonial oppression in Puerto Rico."',
      },
    ],
  },

  // ── Unit 12.4 Then and Now ───────────────────────────────────────────────
  // Weeks 24–30 (Jan 4 – Feb 13, 2027)
  4: {
    unit: "Unit 12.4 · Weeks 24–30",
    title: "Then and Now",
    overview:
      "In this unit we compare historical and contemporary texts to understand how the world has changed — and what has stayed the same. You will develop skills in critical analysis, debate, and academic writing.",
    keyQuestion:
      "How does understanding the past help us make sense of the present and prepare for the future?",
    concepts: [
      {
        term: "Cause and Effect",
        pronunciation: "/kɔːz ænd ɪˈfɛkt/",
        color: "#22d3ee",
        icon: "⛓",
        definition:
          "A relationship between events where one event (the cause) makes another event happen (the effect). Signal words include: because, therefore, as a result, consequently.",
        example:
          '"Because Puerto Rico was devastated by Hurricane María (cause), thousands of families relocated to the mainland United States (effect)."',
      },
      {
        term: "Historical Context",
        pronunciation: "/hɪˈstɔːrɪkəl ˈkɒntɛkst/",
        color: "#f59e0b",
        icon: "📜",
        definition:
          "The social, political, and cultural circumstances in which a text was written. Understanding context helps explain why an author wrote what they did.",
        example:
          '"To understand why Albizu Campos wrote this speech, we must understand the historical context of the Puerto Rican independence movement in the 1930s."',
      },
      {
        term: "Debate",
        pronunciation: "/dɪˈbeɪt/",
        color: "#34d399",
        icon: "⚖️",
        definition:
          "A structured argument where two sides present opposing viewpoints using evidence and reasoning. Good debaters anticipate and counter the other side's arguments.",
        example:
          `"The debate topic was: 'Puerto Rico should become a U.S. state.' Each side used historical evidence, economic data, and cultural arguments."`,
      },
    ],
  },

  // ── Unit 12.5 See It My Way ──────────────────────────────────────────────
  // Weeks 31–36 (Feb 16 – Mar 27, 2027)
  5: {
    unit: "Unit 12.5 · Weeks 31–36",
    title: "See It My Way",
    overview:
      "In this unit we master persuasion — how to make others agree with your point of view using language, evidence, and rhetoric. You will write persuasive letters, speeches, and essays about real community issues.",
    keyQuestion:
      "What do you believe in strongly enough to defend? How do you convince others to see it your way?",
    concepts: [
      {
        term: "Ethos",
        pronunciation: "/ˈiːθɒs/",
        color: "#f59e0b",
        icon: "🏛️",
        definition:
          "An appeal to credibility or character. The speaker convinces the audience by demonstrating expertise, trustworthiness, or authority.",
        example:
          '"As a doctor with 20 years of experience, I can tell you that this treatment works." — The speaker uses ethos by citing their expertise.',
      },
      {
        term: "Pathos",
        pronunciation: "/ˈpeɪθɒs/",
        color: "#ec4899",
        icon: "❤️",
        definition:
          "An appeal to emotion. The speaker connects with the audience's feelings — fear, hope, sympathy, anger — to make the message resonate.",
        example:
          '"Think about the children who go to bed hungry every night. We can change that." — The speaker uses pathos to create empathy.',
      },
      {
        term: "Logos",
        pronunciation: "/ˈloʊɡɒs/",
        color: "#22d3ee",
        icon: "📊",
        definition:
          "An appeal to logic and reason. The speaker uses facts, statistics, and structured arguments to build a rational case.",
        example:
          '"Studies show that recycling reduces landfill waste by 40%." — The speaker uses logos by citing a statistic.',
      },
    ],
  },

  // ── Unit 12.6 The Long and Short of It ──────────────────────────────────
  // Weeks 37–42 (Mar 29 – May 8, 2027)
  6: {
    unit: "Unit 12.6 · Weeks 37–42",
    title: "The Long and Short of It",
    overview:
      "In this final unit you write an original short story. You will analyze how published authors craft characters, setting, and plot — and apply those techniques in your own creative writing.",
    keyQuestion:
      "How do your own experiences, background, and culture inform your creative writing?",
    concepts: [
      {
        term: "Character Development",
        pronunciation: "/ˈkærɪktər dɪˈvɛləpmənt/",
        color: "#f59e0b",
        icon: "🧑‍🎭",
        definition:
          "The process by which an author reveals a character's personality, motivations, and growth throughout a story. Well-developed characters feel real and complex.",
        example:
          '"At the start of the story, Elena is afraid to speak up. By the end, she gives a speech in front of the entire school. This growth is her character development."',
      },
      {
        term: "Setting",
        pronunciation: "/ˈsɛtɪŋ/",
        color: "#34d399",
        icon: "🌆",
        definition:
          "The time and place in which a story occurs. Setting creates atmosphere and can reflect or influence characters' emotions and actions.",
        example:
          '"The story is set in old San Juan during a rainstorm. The narrow colonial streets and the sound of rain on the cobblestones make the reader feel isolated and anxious."',
      },
      {
        term: "Plot Structure",
        pronunciation: "/plɒt ˈstrʌktʃər/",
        color: "#a78bfa",
        icon: "📈",
        definition:
          "The sequence of events in a story, typically following: exposition → rising action → climax → falling action → resolution.",
        example:
          '"In the exposition, we meet Ana in her village. The rising action builds as she discovers the secret. The climax is her confrontation. The resolution shows a changed community."',
      },
    ],
  },
};

// ── Get current unit concepts based on school week ───────────────────────────
// Pacing:
//   Week 1       → intro (no specific unit yet)
//   Weeks 2–7    → Unit 12.1
//   Weeks 8–15   → Unit 12.2
//   Weeks 16–23  → Unit 12.3 + breaks
//   Weeks 24–30  → Unit 12.4
//   Weeks 31–36  → Unit 12.5
//   Weeks 37–42  → Unit 12.6

export function getCurrentConcepts() {
  const week = currentSchoolWeek();
  let unitNumber;
  if      (week <= 1)  unitNumber = 1;
  else if (week <= 7)  unitNumber = 1;
  else if (week <= 15) unitNumber = 2;
  else if (week <= 23) unitNumber = 3;
  else if (week <= 30) unitNumber = 4;
  else if (week <= 36) unitNumber = 5;
  else                 unitNumber = 6;
  return UNITS_CONCEPTS[unitNumber];
}

// ── AI tutor system prompt ────────────────────────────────────────────────────
export const TUTOR_SYSTEM_PROMPT = (currentQuestion) => {
  const concepts = getCurrentConcepts();
  return `You are an ESL tutor for a 12th-grade student at Escuela Superior Fernando Suria Chaves in Barceloneta, Puerto Rico.

Current unit: ${concepts.title} — ${concepts.unit}
Unit focus: ${concepts.overview}

CURRENT QUESTION: "${currentQuestion?.text || "General help"}"

RULES:
1. NEVER give the direct answer or write sentences the student can copy.
2. Use the Socratic method — ask guiding questions.
3. Give hints that point them in the right direction without completing their thought.
4. Give specific feedback: praise strengths, guide improvement.
5. Help with vocabulary and grammar in service of their own ideas.

LANGUAGE: Default English. Switch to Spanish if student writes in Spanish or asks. Spanglish is fine.
TONE: Warm, encouraging, patient — like a knowledgeable friend who wants them to succeed.`;
};
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  