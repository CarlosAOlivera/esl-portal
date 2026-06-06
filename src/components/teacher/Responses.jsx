// Responses — teacher view of submitted student work.
// Fetches all student_responses from Supabase, joined with profiles for names/initials.
// The teacher can mark individual responses as reviewed (local state).

import { useState, useEffect } from "react";
import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";
import { supabase } from "../../lib/supabaseClient";

export default function Responses() {
  const [responses, setResponses] = useState([]);
  const [reviewed, setReviewed]   = useState({});   // keyed by response id
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    async function fetchResponses() {
      setLoading(true);
      const { data, error } = await supabase
        .from("student_responses")
        .select("*, profiles(full_name, avatar_initials)")
        .order("submitted_at", { ascending: false });

      if (error) {
        console.error("Failed to load responses:", error);
        setError("Could not load responses. Please refresh.");
      } else {
        setResponses(data || []);
      }
      setLoading(false);
    }

    fetchResponses();
  }, []);

  const toggleReviewed = (id) =>
    setReviewed((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div
        style={{
          maxWidth: 820,
          margin: "80px auto",
          textAlign: "center",
          color: "rgba(148,163,184,0.5)",
          fontFamily: FONT_SANS,
          fontSize: 14,
        }}
      >
        Loading responses…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          maxWidth: 820,
          margin: "80px auto",
          textAlign: "center",
          color: "#f87171",
          fontFamily: FONT_SANS,
          fontSize: 14,
        }}
      >
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            color: "#fff",
            fontSize: 20,
            margin: "0 0 3px",
            fontFamily: FONT_SERIF,
          }}
        >
          Class Responses
        </h2>
        <p
          style={{
            color: "rgba(148,163,184,0.5)",
            fontSize: 13,
            margin: 0,
            fontFamily: FONT_SANS,
          }}
        >
          {responses.length} submitted ·{" "}
          {Object.values(reviewed).filter(Boolean).length} reviewed
        </p>
      </div>

      {responses.length === 0 && (
        <div
          style={{
            ...CARD_STYLE,
            padding: "48px 32px",
            textAlign: "center",
            color: "rgba(148,163,184,0.45)",
            fontFamily: FONT_SANS,
            fontSize: 14,
          }}
        >
          No submissions yet.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {responses.map((response) => {
          const profile      = response.profiles || {};
          const name         = profile.full_name || "Unknown Student";
          const initials     = profile.avatar_initials || "??";
          const isReviewed   = !!reviewed[response.id];
          const answers      = response.answers || {};
          const answerKeys   = Object.keys(answers);
          const submittedAt  = response.submitted_at
            ? new Date(response.submitted_at).toLocaleString("en-US")
            : "";

          return (
            <div
              key={response.id}
              style={{
                ...CARD_STYLE,
                overflow: "hidden",
              }}
            >
              {/* Student header row */}
              <div
                style={{
                  padding: "12px 19px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                    fontFamily: FONT_SANS,
                  }}
                >
                  {initials}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: FONT_SANS,
                    }}
                  >
                    {name}
                  </div>
                  {submittedAt && (
                    <div
                      style={{
                        color: "rgba(148,163,184,0.4)",
                        fontSize: 11,
                        marginTop: 2,
                        fontFamily: FONT_SANS,
                      }}
                    >
                      Submitted {submittedAt}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => toggleReviewed(response.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    border: isReviewed
                      ? "1px solid rgba(52,211,153,0.3)"
                      : "1px solid rgba(255,255,255,0.12)",
                    background: isReviewed
                      ? "rgba(52,211,153,0.12)"
                      : "transparent",
                    color: isReviewed
                      ? "#34d399"
                      : "rgba(148,163,184,0.6)",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: FONT_SANS,
                    flexShrink: 0,
                  }}
                >
                  {isReviewed ? "✓ Reviewed" : "Mark as reviewed"}
                </button>
              </div>

              {/* Answers */}
              <div
                style={{
                  padding: "13px 19px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {answerKeys.length === 0 && (
                  <div
                    style={{
                      color: "rgba(148,163,184,0.35)",
                      fontSize: 12,
                      fontFamily: FONT_SANS,
                    }}
                  >
                    No answers recorded.
                  </div>
                )}
                {answerKeys.map((questionId, index) => {
                  const value = answers[questionId];
                  const display =
                    value === null
                      ? "(no answer)"
                      : typeof value === "number"
                      ? `Option ${String.fromCharCode(65 + value)} selected`
                      : value || "(empty)";

                  return (
                    <div key={questionId}>
                      <div
                        style={{
                          color: "rgba(148,163,184,0.45)",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          marginBottom: 4,
                          fontFamily: FONT_SANS,
                        }}
                      >
                        Question {index + 1}
                      </div>
                      <div
                        style={{
                          color: "#cbd5e1",
                          fontSize: 13,
                          lineHeight: 1.65,
                          fontFamily: FONT_SANS,
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 8,
                          padding: "9px 12px",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {display}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
