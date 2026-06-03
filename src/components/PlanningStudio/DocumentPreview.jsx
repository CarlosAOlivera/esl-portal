import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";

export default function DocumentPreview({ document, onClose }) {
  const unitAbbrev = document.unit
    ? document.unit.replace(/\s*\(.*?\)\s*/g, "").trim()
    : document.unit;

  const paragraphs = (document.content || "").split("\n\n");

  return (
    <div
      className="planning-studio-print-root"
      style={{ ...CARD_STYLE, width: "100%", padding: 24 }}
    >
      <style>{`
        @media print {
          body > * {
            display: none !important;
          }
          .planning-studio-print-root {
            display: block !important;
            position: fixed;
            inset: 0;
            background: #fff;
            color: #000;
            font-family: Georgia, serif;
            padding: 40px 50px;
            font-size: 12pt;
            line-height: 1.7;
          }
          .print-header {
            border-bottom: 2px solid #000;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .print-header h1 {
            font-size: 18pt;
            margin: 0 0 4px;
          }
          .print-header .print-meta {
            font-size: 10pt;
            color: #444;
          }
          .no-print {
            display: none !important;
          }
          .print-content {
            white-space: pre-wrap;
            font-size: 11pt;
          }
        }
      `}</style>

      {/* Letterhead — hidden on screen, shown when printing */}
      <div className="print-header" style={{ display: "none" }}>
        <h1>{document.title}</h1>
        <div className="print-meta">
          <div>
            <strong>Escuela Superior Fernando Suria Chaves</strong> — Barceloneta, Puerto Rico
          </div>
          <div>Teacher: Prof. Carlos Olivera</div>
          <div>PR Department of Education · Grade 12 ESL</div>
          <div style={{ marginTop: 6 }}>
            <strong>Document:</strong> {document.docType} &nbsp;|&nbsp;
            <strong>Unit:</strong> {document.unit} &nbsp;|&nbsp;
            <strong>Skill Focus:</strong> {document.skill} &nbsp;|&nbsp;
            <strong>Proficiency:</strong> {document.proficiency} &nbsp;|&nbsp;
            <strong>Generated:</strong> {document.generatedAt}
          </div>
        </div>
      </div>

      {/* In-app top bar */}
      <div
        className="no-print"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <h3
          style={{
            margin: 0,
            flexGrow: 1,
            color: "#fff",
            fontFamily: FONT_SERIF,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {document.title}
        </h3>
        <button
          onClick={() => window.print()}
          style={{
            padding: "8px 16px",
            borderRadius: 9,
            border: "none",
            background: "linear-gradient(135deg,#3b82f6,#6366f1)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONT_SANS,
          }}
        >
          Print / Save PDF
        </button>
        <button
          onClick={onClose}
          style={{
            padding: "8px 14px",
            borderRadius: 9,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "#e2e8f0",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONT_SANS,
          }}
        >
          &larr; Back
        </button>
      </div>

      {/* In-app meta chips */}
      <div
        className="no-print"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 18,
        }}
      >
        {[
          document.docType,
          unitAbbrev,
          document.skill,
          document.proficiency,
        ]
          .filter(Boolean)
          .map((label) => (
            <span
              key={label}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 20,
                padding: "3px 12px",
                fontSize: 11,
                color: "rgba(148,163,184,0.9)",
                fontFamily: FONT_SANS,
                fontWeight: 500,
              }}
            >
              {label}
            </span>
          ))}
      </div>

      {/* Content — visible on screen and in print */}
      <div
        className="print-content"
        style={{
          maxHeight: "60vh",
          overflowY: "auto",
          fontFamily: FONT_SANS,
          fontSize: 14,
          color: "#e2e8f0",
          lineHeight: 1.8,
        }}
      >
        {paragraphs.map((para, i) => (
          <p key={i} style={{ margin: "0 0 16px" }}>
            {para.split("\n").map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}
