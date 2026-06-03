import { useState } from "react";
import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";
import DocumentPreview from "./DocumentPreview";
import SessionHistory from "./SessionHistory";
import "./PlanningStudio.css";

const UNITS = [
  "Unit 1: Identity & Community (Weeks 1–6)",
  "Unit 2: Technology & Society (Weeks 7–13)",
  "Unit 3: Environmental Challenges (Weeks 14–20)",
  "Unit 4: Career & Future Goals (Weeks 21–26)",
  "Unit 5: Global Citizenship (Weeks 27–32)",
  "Unit 6: The Long and Short of It — Literary Elements (Weeks 33–38)",
];

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

export default function PlanningStudio({ user }) {
  const [selectedUnit, setSelectedUnit]           = useState("");
  const [selectedSkill, setSelectedSkill]         = useState("");
  const [selectedDocType, setSelectedDocType]     = useState("");
  const [selectedProficiency, setSelectedProficiency] = useState("");
  const [freeContext, setFreeContext]             = useState("");
  const [isGenerating, setIsGenerating]           = useState(false);
  const [currentDocument, setCurrentDocument]     = useState(null);
  const [sessionHistory, setSessionHistory]       = useState([]);

  const canGenerate =
    !isGenerating &&
    selectedUnit !== "" &&
    selectedSkill !== "" &&
    selectedDocType !== "" &&
    selectedProficiency !== "";

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);

    const prompt = `You are an expert ESL curriculum designer working with Prof. Carlos Olivera at Escuela Superior Fernando Suria Chaves, Barceloneta, Puerto Rico. Generate a ${selectedDocType} for Grade 12 ESL students aligned to the PR Department of Education Pacing Calendar.

Unit: ${selectedUnit}
Skill Focus: ${selectedSkill}
Proficiency Level: ${selectedProficiency}
${freeContext ? `Additional context from teacher: ${freeContext}` : ""}

Generate a complete, classroom-ready ${selectedDocType}. Format it clearly with sections, headers, and specific activities or criteria. Make it practical and immediately usable.`;

    try {
      const response = await fetch("http://localhost:3001/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const responseText = data.content[0].text;

      const doc = {
        title: `${selectedDocType} — ${selectedUnit.split(":")[0]}`,
        content: responseText,
        docType: selectedDocType,
        unit: selectedUnit,
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
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              style={{ ...FIELD_STYLE, cursor: "pointer" }}
            >
              <option value="">Select…</option>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
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
