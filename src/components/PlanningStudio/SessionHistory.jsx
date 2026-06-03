import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";

export default function SessionHistory({ history, onSelect, selectedIndex }) {
  if (history.length === 0) {
    return (
      <div
        style={{
          color: "rgba(148,163,184,0.35)",
          fontSize: 12,
          fontFamily: FONT_SANS,
          textAlign: "center",
          padding: "16px 0",
        }}
      >
        No documents yet
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          color: "rgba(148,163,184,0.45)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 10,
          fontFamily: FONT_SANS,
        }}
      >
        Recent Documents
      </div>
      <div className="session-history-grid">
        {history.map((doc, index) => {
          const isSelected = index === selectedIndex;
          const unitShort = doc.unit ? doc.unit.split(":")[0] : "";
          return (
            <button
              key={index}
              onClick={() => onSelect(doc)}
              style={{
                ...CARD_STYLE,
                padding: "10px 14px",
                cursor: "pointer",
                borderColor: isSelected
                  ? "rgba(232,160,32,0.4)"
                  : "rgba(255,255,255,0.09)",
                background: isSelected
                  ? "rgba(232,160,32,0.08)"
                  : "rgba(255,255,255,0.04)",
                textAlign: "left",
                border: isSelected
                  ? "1px solid rgba(232,160,32,0.4)"
                  : "1px solid rgba(255,255,255,0.09)",
                borderRadius: 20,
                display: "block",
                width: "100%",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <div
                style={{
                  color: isSelected ? "#F5C060" : "#e2e8f0",
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 3,
                  fontFamily: FONT_SERIF,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {doc.docType}
              </div>
              <div
                style={{
                  color: isSelected
                    ? "rgba(245,192,96,0.7)"
                    : "rgba(148,163,184,0.6)",
                  fontSize: 11,
                  fontFamily: FONT_SANS,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginBottom: 4,
                }}
              >
                {unitShort}
              </div>
              <div
                style={{
                  color: "rgba(148,163,184,0.35)",
                  fontSize: 10,
                  fontFamily: FONT_SANS,
                }}
              >
                {doc.generatedAt}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
