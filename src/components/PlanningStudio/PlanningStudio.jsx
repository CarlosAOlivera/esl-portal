import { useState } from "react";
import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";
import { UNITS_CONCEPTS } from "../../data/mockData";
import DocumentPreview from "./DocumentPreview";
import SessionHistory from "./SessionHistory";
import "./PlanningStudio.css";

// Build unit options from real curriculum seed data
const UNITS = Object.values(UNITS_CONCEPTS).map((u) => ({
  label: `${u.unit} — ${u.title}`,
  data:  u,
}));

const DOC_TYPES = [
  "Lesson Plan",
  "Rubric",
  "Test Spec",
  "Exit Ticket",
  "Scaffold / Graphic Organizer",
];

const SKILLS = ["Reading", "Writing", "Listening", "Speaking", "Language"];

const PROFICIENCY_LEVELS = ["Beginning", "Intermediate", "Advanced"];

const FIELD_STYLE = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 10,
  color: "#e2e8f0",
  fontSize: 13,
  padding: "9px 12px",
  fontFamily: FONT_SANS,
  outline: "none",
  boxSizing: "border-box",
};

function LabeledField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          color: "rgba(148,163,184,0.6)",
          fontSize: 11,
          fontWeight: 600,
          marginBottom: 6,
          letterSpacing: "0.05em",
          fontFamily: FONT_SANS,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export default function PlanningStudio({ user, flippedItems = [], assignments = [] }) {
  const [selectedUnit, setSelectedUnit]           = useState(null); // full unit object from UNITS_CONCEPTS
  const [selectedSkill, setSelectedSkill]         = useState("");
  const [selectedDocType, setSelectedDocType]     = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState("");
  const [freeContext, setFreeContext]             = useState("");
  const [isGenerating, setIsGenerating]           = useState(false);
  const [currentDocument, setCurrentDocument]     = useState(null);
  const [sessionHistory, setSessionHistory]       = useState([]);

  const canGenerate =
    !isGenerating &&
    selectedUnit !== null &&
    selectedSkill !== "" &&
    selectedDocType !== "" &&
    selectedProficiency !== "";

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);

    const unitConceptList = (selectedUnit.concepts || [])
      .map((c) => `• ${c.term}: ${c.definition}`)
      .join("\n");

    // Build context from real app data — flipped materials and assignments for this unit
    const unitKey = selectedUnit.unit; // e.g. "Unit 12.1 · Weeks 2–7"
    const unitFlipped = flippedItems.filter(
      (m) => !m.unit || m.unit === unitKey || m.title?.toLowerCase().includes("12.1")
    );
    const unitAssignments = assignments.filter(
      (a) => !a.unit || a.unit === unitKey || a.unit?.includes("12.1")
    );

    // Summarize flip materials for the prompt
    const flipContext = unitFlipped.length > 0
      ? unitFlipped.map((m) => `• [${m.type?.toUpperCase() || "MATERIAL"}] "${m.title}" — ${m.description || "flipped pre-class material"}`).join("\n")
      : "• No flipped materials assigned yet for this unit.";

    // Summarize assignments (one per day ideally) for developing/closing/evaluation
    const assignmentContext = unitAssignments.length > 0
      ? unitAssignments.map((a, i) => {
          const qs = (a.questions || []).map((q, qi) =>
            `    Q${qi + 1} [${q.type}]: ${q.text}`
          ).join("\n");
          return `• Assignment ${i + 1}: "${a.title}" (${a.status})\n${qs}`;
        }).join("\n")
      : "• No assignments created yet for this unit. Generate realistic class activities using the ESL Portal app (students complete MC, short answer, and journal questions on their devices during class).";

    // Lesson Plan → structured JSON for DE weekly format; all other types → free-form
    const prompt = selectedDocType === "Lesson Plan"
      ? `You are an expert ESL curriculum designer for Prof. Carlos Olivera, Grade 12 ESL, Escuela Superior Fernando Suria Chaves, Barceloneta, Puerto Rico.

This is a FLIPPED CLASSROOM. Students review assigned pre-class material (video/audio/reading) at HOME before each class. During class they complete activities using an ESL web app on their devices where they answer Multiple Choice, Short Answer, and Journal/Reflection questions.

Generate a WEEKLY LESSON PLAN following the PR Department of Education "English 12 Weekly Plan (Regular Teacher)" format (Mon–Fri).

UNIT: ${selectedUnit.unit} — ${selectedUnit.title}
OVERVIEW: ${selectedUnit.overview}
KEY QUESTION: ${selectedUnit.keyQuestion}
KEY VOCABULARY & CONCEPTS (from PR-DE pacing calendar seed):
${unitConceptList}

FLIPPED PRE-CLASS MATERIALS (students reviewed these at home before coming to class):
${flipContext}

IN-CLASS APP ASSIGNMENTS (students complete these ON THEIR DEVICES during class — these are the actual "Developing" tasks):
${assignmentContext}

SKILL FOCUS: ${selectedSkill}
PROFICIENCY LEVEL: ${selectedProficiency}
${freeContext ? `TEACHER NOTES: ${freeContext}` : ""}

STRUCTURE EACH DAY AS FOLLOWS:
- initial: Start with a brief warm-up (2–3 min) that combines reviewing the key vocabulary/concepts from the seed WITH a brief check-in on the flipped pre-class material the student watched/read at home (e.g., "Yesterday you watched a video about X — who can tell me one thing they learned?"). Include teacher facilitation steps. Use the ESL Portal app (projector) to show the flipped material if needed.
- developing: The main in-class activity IS the ESL Portal app assignment. Describe step-by-step how the teacher facilitates while students work on their devices answering the assignment questions (MC, short answer, journal). Reference the specific assignment title and question types listed above. Distribute the assignments across Mon–Fri; if there are fewer assignments than days, fill remaining days with vocabulary practice or peer discussion tied to the unit concepts.
- closing: Brief exit activity (3–5 min) tied directly to what students completed in the app — e.g., pair-share an answer, quick class discussion of a reflection question, or teacher collects a notable response to share.
- evaluation: List the specific tasks completed that day (e.g., "Formative — ESL Portal: [Assignment Title] — MC Q1–Q3, Short Answer Q4; Exit ticket: pair-share reflection").
- materials: Include "ESL Portal app (student devices)", "Projector (teacher display)", and the specific flipped material title if used that day. Add standard materials as needed.

Output ONLY a valid JSON object — no text before or after, no markdown code fences. Use exactly this structure:
{
  "week": "e.g. 12.1.1",
  "theme": "Weekly theme title aligned to the unit",
  "transversalThemes": ["Equity and Respect among All Human Beings"],
  "generatorThemes": ["Diversity", "Ethical Coexistence"],
  "days": {
    "Monday": {
      "standards": "PR-DE standards codes (e.g. 12.LS.1.1, 12.W.8.1)",
      "indicators": "indicator codes (e.g. 12.LS.1.1b)",
      "objectives": ["Students will be able to..."],
      "initial": ["1. Warm-up step referencing flipped material", "2. Vocabulary check step"],
      "developing": ["1. Teacher launches ESL Portal assignment on projector", "2. Students open app on devices and complete [assignment title]", "3. Teacher circulates and supports"],
      "closing": ["1. Specific exit activity tied to the day's app assignment"],
      "integration": "N/A",
      "evaluation": "Formative — ESL Portal: [Assignment Title] — [question types]; Exit ticket",
      "accommodations": "Extended time; read-aloud support; visual vocabulary anchor chart",
      "materials": ["ESL Portal app (student devices)", "Projector (teacher display)", "Whiteboard", "PowerPoint"]
    },
    "Tuesday": {},
    "Wednesday": {},
    "Thursday": {},
    "Friday": {}
  }
}`
      : `You are an expert ESL curriculum designer working with Prof. Carlos Olivera at Escuela Superior Fernando Suria Chaves, Barceloneta, Puerto Rico. Generate a ${selectedDocType} for Grade 12 ESL students aligned to the PR Department of Education Pacing Calendar.

UNIT: ${selectedUnit.unit} — ${selectedUnit.title}
OVERVIEW: ${selectedUnit.overview}
KEY QUESTION: ${selectedUnit.keyQuestion}
KEY VOCABULARY & CONCEPTS:
${unitConceptList}

DOCUMENT TYPE: ${selectedDocType}
SKILL FOCUS: ${selectedSkill}
PROFICIENCY LEVEL: ${selectedProficiency}
${freeContext ? `ADDITIONAL CONTEXT FROM TEACHER: ${freeContext}` : ""}

Generate a complete, classroom-ready ${selectedDocType}. Reference the unit's key concepts and vocabulary above wherever relevant. Format it clearly with sections, headers, and specific activities or criteria. Make it practical and immediately usable.`;

    try {
      const response = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: selectedDocType === "Lesson Plan" ? 8000 : 4000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const responseText = data.content[0].text;

      const doc = {
        title: `${selectedDocType} — ${selectedUnit.unit}`,
        content: responseText,
        docType: selectedDocType,
        unit: `${selectedUnit.unit} — ${selectedUnit.title}`,
        skill: selectedSkill,
        proficiency: selectedProficiency,
        generatedAt: new Date().toLocaleString("en-US"),
      };

      setCurrentDocument(doc);
      setSessionHistory((prev) => [doc, ...prev].slice(0, 8));
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
      {/* Two-column layout */}
      <div className="planning-studio-layout">
        {/* Left column — form controls */}
        <div
          className="planning-studio-form"
          style={{
            ...CARD_STYLE,
            padding: "24px 22px",
            minWidth: 320,
            flexShrink: 0,
            alignSelf: "flex-start",
          }}
        >
          <div style={{ marginBottom: 22 }}>
            <h2
              style={{
                color: "#fff",
                fontSize: 20,
                margin: "0 0 4px",
                fontFamily: FONT_SERIF,
              }}
            >
              Planning Studio
            </h2>
            <p
              style={{
                color: "rgba(148,163,184,0.5)",
                fontSize: 13,
                margin: 0,
                fontFamily: FONT_SANS,
              }}
            >
              AI-powered lesson planning tools
            </p>
          </div>

          <LabeledField label="Unit">
            <select
              value={selectedUnit ? selectedUnit.unit : ""}
              onChange={(e) => {
                const found = UNITS.find((u) => u.data.unit === e.target.value);
                setSelectedUnit(found ? found.data : null);
              }}
              style={{ ...FIELD_STYLE, cursor: "pointer" }}
            >
              <option value="">Select…</option>
              {UNITS.map((u) => (
                <option key={u.data.unit} value={u.data.unit}>
                  {u.label}
                </option>
              ))}
            </select>
          </LabeledField>

          <LabeledField label="Document Type">
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              style={{ ...FIELD_STYLE, cursor: "pointer" }}
            >
              <option value="">Select…</option>
              {DOC_TYPES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </LabeledField>

          <LabeledField label="Skill Focus">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              style={{ ...FIELD_STYLE, cursor: "pointer" }}
            >
              <option value="">Select…</option>
              {SKILLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </LabeledField>

          <LabeledField label="Proficiency Level">
            <select
              value={selectedProficiency}
              onChange={(e) => setSelectedProficiency(e.target.value)}
              style={{ ...FIELD_STYLE, cursor: "pointer" }}
            >
              <option value="">Select…</option>
              {PROFICIENCY_LEVELS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </LabeledField>

          <LabeledField label="Additional context / notes">
            <textarea
              value={freeContext}
              onChange={(e) => setFreeContext(e.target.value)}
              rows={4}
              placeholder="e.g., Students have just read Chapter 3. Focus on vocabulary related to climate change."
              style={{ ...FIELD_STYLE, resize: "vertical", lineHeight: 1.5 }}
            />
          </LabeledField>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              background: canGenerate
                ? "linear-gradient(135deg,#E8A020,#F5C060)"
                : "rgba(255,255,255,0.07)",
              color: canGenerate ? "#0A1628" : "rgba(148,163,184,0.35)",
              fontSize: 14,
              fontWeight: 700,
              cursor: canGenerate ? "pointer" : "not-allowed",
              fontFamily: FONT_SANS,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "opacity 0.15s",
            }}
          >
            {isGenerating ? (
              <>
                <Spinner />
                Generating…
              </>
            ) : (
              "Generate Document"
            )}
          </button>
        </div>

        {/* Right column — document preview or placeholder */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {currentDocument ? (
            <DocumentPreview
              document={currentDocument}
              onClose={() => setCurrentDocument(null)}
            />
          ) : (
            <div
              style={{
                ...CARD_STYLE,
                padding: "48px 32px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 320,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "rgba(232,160,32,0.1)",
                  border: "1px solid rgba(232,160,32,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  fontSize: 22,
                }}
              >
                <span style={{ color: "#E8A020" }}>+</span>
              </div>
              <div
                style={{
                  color: "#e2e8f0",
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 8,
                  fontFamily: FONT_SERIF,
                }}
              >
                Generated documents will appear here
              </div>
              <div
                style={{
                  color: "rgba(148,163,184,0.5)",
                  fontSize: 13,
                  fontFamily: FONT_SANS,
                  maxWidth: 300,
                }}
              >
                Select a unit, document type, skill, and proficiency level, then click Generate.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session history — below both columns */}
      {sessionHistory.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <SessionHistory
            history={sessionHistory}
            onSelect={(doc) => setCurrentDocument(doc)}
            selectedIndex={sessionHistory.indexOf(currentDocument)}
          />
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        border: "2px solid rgba(10,22,40,0.3)",
        borderTopColor: "#0A1628",
        borderRadius: "50%",
        animation: "ps-spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}
