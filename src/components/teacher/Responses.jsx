// Responses — teacher view of submitted student work.
// Shows all students who turned in the active assignment, their AI tutor usage,
// paste-attempt flags, and sample answers from MOCK_ANSWERS (placeholder data).
// The teacher can mark individual responses as reviewed from this view.

import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";
import { MOCK_ANSWERS } from "../../data/mockData";

export default function Responses({ roster, setRoster }) {
  const submittedStudents = roster.filter((student) => student.submitted);

  const toggleReviewed = (studentId) =>
    setRoster((currentRoster) =>
      currentRoster.map((student) =>
        student.id === studentId
          ? { ...student, reviewed: !student.reviewed }
          : student
      )
    );

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
          Respuestas del grupo
        </h2>
        <p
          style={{
            color: "rgba(148,163,184,0.5)",
            fontSize: 13,
            margin: 0,
            fontFamily: FONT_SANS,
          }}
        >
          {submittedStudents.length} entregaron ·{" "}
          {roster.filter((student) => student.reviewed).length} revisadas
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {submittedStudents.map((student) => (
          <div
            key={student.id}
            style={{
              ...CARD_STYLE,
              overflow: "hidden",
              borderColor:
                student.pasteAttempts > 2
                  ? "rgba(239,68,68,0.22)"
                  : "rgba(255,255,255,0.09)",
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
                background:
                  student.pasteAttempts > 2
                    ? "rgba(239,68,68,0.05)"
                    : "transparent",
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
                {student.avatarInitials}
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
                  {student.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 11,
                    marginTop: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {student.tutorMinutes > 0 && (
                    <span
                      style={{
                        color: "rgba(167,139,250,0.7)",
                        fontSize: 11,
                        fontFamily: FONT_SANS,
                      }}
                    >
                      🤖 {student.tutorMinutes} min · {student.tutorMessages}{" "}
                      msgs
                    </span>
                  )}
                  {student.pasteAttempts > 0 && (
                    <span
                      style={{
                        color:
                          student.pasteAttempts > 2 ? "#f87171" : "#fbbf24",
                        fontSize: 11,
                        fontWeight: student.pasteAttempts > 2 ? 700 : 400,
                        fontFamily: FONT_SANS,
                      }}
                    >
                      {student.pasteAttempts > 2 ? "⚠️ " : ""}
                      {student.pasteAttempts} intento(s) de pegar
                    </span>
                  )}
                  {student.pasteAttempts === 0 && student.tutorMinutes === 0 && (
                    <span
                      style={{
                        color: "rgba(148,163,184,0.4)",
                        fontSize: 11,
                        fontFamily: FONT_SANS,
                      }}
                    >
                      Sin actividad del tutor
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => toggleReviewed(student.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 8,
                  border: student.reviewed
                    ? "1px solid rgba(52,211,153,0.3)"
                    : "1px solid rgba(255,255,255,0.12)",
                  background: student.reviewed
                    ? "rgba(52,211,153,0.12)"
                    : "transparent",
                  color: student.reviewed
                    ? "#34d399"
                    : "rgba(148,163,184,0.6)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: FONT_SANS,
                  flexShrink: 0,
                }}
              >
                {student.reviewed ? "✓ Revisado" : "Marcar revisado"}
              </button>
            </div>

            {/* Sample answers */}
            <div
              style={{
                padding: "13px 19px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {MOCK_ANSWERS.map((answer) => (
                <div key={answer.question}>
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
                    {answer.question}
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
                    {answer.response}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
