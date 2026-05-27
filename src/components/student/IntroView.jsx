// IntroView — the first screen students see each class day.
// Animates in the unit's key vocabulary concepts (ethos, pathos, logos) with
// definitions, pronunciation, and an example quote. Ends with a focus question
// and a "Ver material de hoy" button that advances to HomeView.

import { useState, useEffect } from "react";
import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";

export default function IntroView({ onContinue, concepts }) {
  // Tracks which concept cards have been revealed by the stagger animation
  const [revealedIndex, setRevealedIndex] = useState(-1);

  useEffect(() => {
    concepts.concepts.forEach((_, index) => {
      setTimeout(() => setRevealedIndex(index), 300 + index * 180);
    });
  }, []);

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", padding: "28px 20px 48px" }}>
      {/* Unit header */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            color: "rgba(148,163,184,0.5)",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 4,
            fontFamily: FONT_SANS,
          }}
        >
          {concepts.unit}
        </div>
        <h2
          style={{
            color: "#fff",
            fontSize: 22,
            margin: "0 0 10px",
            fontFamily: FONT_SERIF,
          }}
        >
          {concepts.title}
        </h2>
        <p
          style={{
            color: "rgba(148,163,184,0.75)",
            fontSize: 14,
            margin: 0,
            lineHeight: 1.7,
            fontFamily: FONT_SANS,
          }}
        >
          {concepts.overview}
        </p>
      </div>

      {/* Concept cards with stagger-in animation */}
      <div
        style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}
      >
        {concepts.concepts.map((concept, index) => (
          <div
            key={concept.term}
            style={{
              ...CARD_STYLE,
              overflow: "hidden",
              opacity: revealedIndex >= index ? 1 : 0,
              transform:
                revealedIndex >= index ? "translateY(0)" : "translateY(14px)",
              transition: "opacity 0.4s,transform 0.4s",
            }}
          >
            {/* Colored accent bar */}
            <div
              style={{ height: 3, background: concept.color, opacity: 0.7 }}
            />
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              {/* Icon badge */}
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  background: `${concept.color}18`,
                  border: `1px solid ${concept.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {concept.icon}
              </div>

              <div style={{ flex: 1 }}>
                {/* Term + pronunciation */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      color: concept.color,
                      fontSize: 18,
                      fontWeight: 700,
                      fontFamily: FONT_SERIF,
                    }}
                  >
                    {concept.term}
                  </span>
                  <span
                    style={{
                      color: "rgba(148,163,184,0.4)",
                      fontSize: 12,
                      fontFamily: FONT_SANS,
                    }}
                  >
                    {concept.pronunciation}
                  </span>
                </div>

                {/* Definition */}
                <p
                  style={{
                    color: "#cbd5e1",
                    fontSize: 13,
                    margin: "0 0 10px",
                    lineHeight: 1.65,
                    fontFamily: FONT_SANS,
                  }}
                >
                  {concept.definition}
                </p>

                {/* Example quote */}
                <div
                  style={{
                    background: `${concept.color}0d`,
                    border: `1px solid ${concept.color}22`,
                    borderRadius: 9,
                    padding: "8px 12px",
                  }}
                >
                  <div
                    style={{
                      color: "rgba(148,163,184,0.45)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 3,
                      fontFamily: FONT_SANS,
                    }}
                  >
                    Example
                  </div>
                  <p
                    style={{
                      color: "rgba(226,232,240,0.85)",
                      fontSize: 13,
                      margin: 0,
                      fontStyle: "italic",
                      lineHeight: 1.6,
                      fontFamily: FONT_SERIF,
                    }}
                  >
                    {concept.example}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key focus question */}
      <div
        style={{
          ...CARD_STYLE,
          padding: "14px 20px",
          marginBottom: 24,
          borderColor: "rgba(99,102,241,0.25)",
          background: "rgba(99,102,241,0.07)",
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 16 }}>🔑</span>
          <p
            style={{
              color: "#c7d2fe",
              fontSize: 13,
              margin: 0,
              lineHeight: 1.7,
              fontFamily: FONT_SANS,
            }}
          >
            <strong>Key question:</strong> {concepts.keyQuestion}
          </p>
        </div>
      </div>

      <button
        onClick={onContinue}
        style={{
          width: "100%",
          padding: "13px",
          borderRadius: 13,
          border: "none",
          background: "linear-gradient(135deg,#3b82f6,#6366f1)",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: FONT_SANS,
          boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
        }}
      >
        View today's material →
      </button>
    </div>
  );
}
