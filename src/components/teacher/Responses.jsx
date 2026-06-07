// Responses — teacher view of submitted student work.
// Fetches all student_responses from Supabase, joined with profiles for names/initials.
// The teacher can mark individual responses as reviewed (local state).

import { useState, useEffect } from "react";
import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";
import { supabase } from "../../lib/supabaseClient";

export default function Responses({ assignments = [] }) {
  const [responses, setResponses] = useState([]);
  const [reviewed, setReviewed]   = useState({});
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [groupFilter, setGroupFilter] = useState("all"); // "all" | "1"–"5"

  useEffect(() => {
    async function fetchResponses() {
      setLoading(true);
      const { data, error } = await supabase
        .from("student_responses")
        .select("*, profiles(full_name, avatar_initials, group_number)")
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

  const visibleResponses = groupFilter === "all"
    ? responses
    : responses.filter((r) => String(r.profiles?.group_number) === groupFilter);

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
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ color: "#fff", fontSize: 20, margin: "0 0 3px", fontFamily: FONT_SERIF }}>
              Class Responses
            </h2>
            <p style={{ color: "rgba(148,163,184,0.5)", fontSize: 13, margin: 0, fontFamily: FONT_SANS }}>
              {visibleResponses.length} submitted · {Object.values(reviewed).filter(Boolean).length} reviewed
            </p>
          </div>

          {/* Group filter */}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {["all", "1", "2", "3", "4", "5"].map((g) => (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  border: groupFilter === g ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.1)",
                  background: groupFilter === g ? "rgba(99,102,241,0.2)" : "transparent",
                  color: groupFilter === g ? "#a78bfa" : "rgba(148,163,184,0.55)",
                  fontSize: 11,
                  fontWeight: groupFilter === g ? 700 : 400,
                  cursor: "pointer",
                  fontFamily: FONT_SANS,
                }}
              >
                {g === "all" ? "All groups" : `Group ${g}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visibleResponses.length === 0 && (
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
        {visibleResponses.map((response) => {
          const profile      = response.profiles || {};
          const name         = profile.full_name || "Unknown Student";
          const initials     = profile.avatar_initials || "??";
          const groupNum     = profile.group_number;
          const isReviewed   = !!reviewed[response.id];
          const answers      = response.answers || {};
          const answerKeys   = Object.keys(answers);
          const assignment   = assignments.find((a) => a.id === response.assignment_id);
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
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: FONT_SANS }}>
                      {name}
                    </span>
                    {groupNum && (
                      <span style={{ background: "rgba(99,102,241,0.18)", color: "#a78bfa", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, letterSpacing: "0.06em", fontFamily: FONT_SANS }}>
                        GRP {groupNum}
                      </span>
                    )}
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
                  const value    = answers[questionId];
                  const question = assignment?.questions?.find((q) => q.id === questionId);
                  const isMC     = typeof value === "number";
                  const letter   = isMC ? String.fromCharCode(65 + value) : null;

                  // Grading for MC: only if correctIndex is explicitly set
                  const hasKey   = isMC && question?.correctIndex != null;
                  const isCorrect = hasKey && value === question.correctIndex;
                  const isWrong   = hasKey && value !== question.correctIndex;

                  const display = value === null
                    ? "(no answer)"
                    : isMC
                    ? `Option ${letter} — ${question?.options?.[value] || ""}`
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
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        Question {index + 1}
                        {isCorrect && <span style={{ color: "#34d399", fontSize: 11 }}>✓ Correct</span>}
                        {isWrong   && (
                          <span style={{ color: "#f87171", fontSize: 11 }}>
                            ✗ Wrong — correct: Option {String.fromCharCode(65 + question.correctIndex)}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          color: isCorrect ? "#34d399" : isWrong ? "#f87171" : "#cbd5e1",
                          fontSize: 13,
                          lineHeight: 1.65,
                          fontFamily: FONT_SANS,
                          background: isCorrect
                            ? "rgba(52,211,153,0.07)"
                            : isWrong
                            ? "rgba(248,113,113,0.07)"
                            : "rgba(255,255,255,0.03)",
                          borderRadius: 8,
                          padding: "9px 12px",
                          border: isCorrect
                            ? "1px solid rgba(52,211,153,0.2)"
                            : isWrong
                            ? "1px solid rgba(248,113,113,0.2)"
                            : "1px solid rgba(255,255,255,0.06)",
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
