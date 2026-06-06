// Footer — appears at the bottom of every page (student and teacher portals).
// Credits LevelUp Labs, school, and project metadata.

import { FONT_SANS } from "../../styles/tokens";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 10,
        background: "rgba(7,15,30,0.6)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Left — project info */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>📚</span>
        <div>
          <div
            style={{
              color: "rgba(248,250,252,0.7)",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: FONT_SANS,
              letterSpacing: "0.03em",
            }}
          >
            Project ELEVATE · ESL Grade 12
          </div>
          <div
            style={{
              color: "rgba(148,163,184,0.45)",
              fontSize: 11,
              fontFamily: FONT_SANS,
              marginTop: 1,
            }}
          >
            © 2026–2027 Escuela Superior Fernando Suria Chaves · Barceloneta, PR
          </div>
        </div>
      </div>

      {/* Right — LevelUp Labs credit */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "rgba(148,163,184,0.4)",
          fontSize: 11,
          fontFamily: FONT_SANS,
        }}
      >
        <span>Built by</span>
        <span
          style={{
            background: "linear-gradient(135deg,#E8A020,#F5C060)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.03em",
          }}
        >
          LevelUp Labs
        </span>
        <span
          style={{
            background: "rgba(232,160,32,0.15)",
            border: "1px solid rgba(232,160,32,0.25)",
            color: "#E8A020",
            fontSize: 9,
            fontWeight: 700,
            padding: "1px 6px",
            borderRadius: 20,
            letterSpacing: "0.08em",
            fontFamily: FONT_SANS,
          }}
        >
          v1.0
        </span>
      </div>
    </footer>
  );
}
