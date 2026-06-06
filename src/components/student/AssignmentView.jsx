// AssignmentView — the in-class assignment screen for students.
// Renders three question types: multiple choice, short answer, and journal.
// Enforces per-question minimum word counts and blocks copy-paste.
// Shows a locked screen outside school hours.
// Integrates the AI TutorPanel as a collapsible side drawer.

import { useState, useEffect, useRef } from "react";
import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";
import { wordCount } from "../../data/mockData";
import { useSchoolHours } from "../../hooks/useSchoolHours";
import { useIsMobile } from "../../hooks/useIsMobile";
import TutorPanel from "./TutorPanel";
import { supabase } from "../../lib/supabaseClient";

export default function AssignmentView({ assignment }) {
  // Answers keyed by question ID; MC questions start null, text questions start ""
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(
      assignment.questions.map((q) => [
        q.id,
        q.type === "multiple_choice" ? null : "",
      ])
    )
  );
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isTutorOpen, setIsTutorOpen]       = useState(false);
  const [isSubmitted, setIsSubmitted]       = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [submitError, setSubmitError]       = useState(null);
  const [showPasteWarning, setShowPasteWarning] = useState(false);

  // Academic integrity counters — saved to Supabase on submit
  const pasteAttemptsRef = useRef(0);
  const tabawayCountRef  = useRef(0);

  const isSchoolHours = useSchoolHours();
  const isMobile = useIsMobile();

  // Track when the student leaves the assignment tab/window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabawayCountRef.current += 1;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleSubmit = async () => {
    if (!isAllComplete || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase
        .from("student_responses")
        .upsert({
          student_id: session.user.id,
          assignment_id: assignment.id,
          answers,
          submitted_at: new Date().toISOString(),
          paste_attempts: pasteAttemptsRef.current,
          tabaway_count:  tabawayCountRef.current,
        });
      if (error) throw error;
      setIsSubmitted(true);
    } catch (err) {
      setSubmitError("Could not save your answers. Please try again.");
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Warns the student and increments paste counter
  const handlePasteAttempt = (event) => {
    event.preventDefault();
    pasteAttemptsRef.current += 1;
    setShowPasteWarning(true);
    setTimeout(() => setShowPasteWarning(false), 3000);
  };

  // Completion is derived from each question's own type and minWords value
  const questionCompletionFlags = assignment.questions.map((q) => {
    const answer = answers[q.id];
    if (q.type === "multiple_choice") return answer !== null;
    return wordCount(answer || "") >= (q.minWords || 0);
  });
  const isAllComplete = questionCompletionFlags.every(Boolean);

  const currentQuestion = assignment.questions[activeQuestionIndex];

  // ── Locked screen (outside school hours) ─────────────────────────────────────
  if (!isSchoolHours) {
    return (
      <div
        style={{
          maxWidth: 500,
          margin: "80px auto",
          padding: "0 20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 46, marginBottom: 14 }}>🔒</div>
        <h2
          style={{
            color: "#fff",
            fontSize: 20,
            fontFamily: FONT_SERIF,
            marginBottom: 7,
          }}
        >
          Assignment Unavailable
        </h2>
        <p
          style={{
            color: "rgba(148,163,184,0.65)",
            fontSize: 14,
            fontFamily: FONT_SANS,
            lineHeight: 1.6,
          }}
        >
          Only accessible from{" "}
          <strong style={{ color: "#60a5fa" }}>7:30am–2:30pm</strong>
        </p>
      </div>
    );
  }

  // ── Submitted confirmation screen ─────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <div
        style={{
          maxWidth: 520,
          margin: "80px auto",
          padding: "0 20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 54, marginBottom: 14 }}>🎉</div>
        <h2
          style={{
            color: "#fff",
            fontSize: 22,
            fontFamily: FONT_SERIF,
            marginBottom: 7,
          }}
        >
          Assignment Submitted!
        </h2>
        <p
          style={{
            color: "rgba(148,163,184,0.7)",
            fontFamily: FONT_SANS,
            fontSize: 14,
            marginBottom: 24,
          }}
        >
          Your answers have been saved successfully.
        </p>
        <div
          style={{
            ...CARD_STYLE,
            padding: "14px 20px",
            display: "inline-block",
            borderColor: "rgba(52,211,153,0.25)",
            background: "rgba(52,211,153,0.06)",
          }}
        >
          <div style={{ color: "#34d399", fontWeight: 600, fontFamily: FONT_SANS }}>
            ✓ {assignment.title}
          </div>
          <div
            style={{
              color: "rgba(148,163,184,0.55)",
              fontSize: 12,
              marginTop: 3,
              fontFamily: FONT_SANS,
            }}
          >
            {new Date().toLocaleTimeString("en-US")}
          </div>
        </div>
      </div>
    );
  }

  // ── Main assignment view ──────────────────────────────────────────────────────
  return (
    <div
      style={{
        maxWidth: isTutorOpen && !isMobile ? "calc(100vw - 390px)" : 720,
        margin: "0 auto",
        padding: "22px 20px 48px",
        transition: "max-width 0.3s",
      }}
    >
      {/* Paste warning toast */}
      {showPasteWarning && (
        <div
          style={{
            position: "fixed",
            top: 74,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(239,68,68,0.95)",
            color: "#fff",
            padding: "9px 18px",
            borderRadius: 10,
            fontSize: 13,
            fontFamily: FONT_SANS,
            zIndex: 999,
            whiteSpace: "nowrap",
          }}
        >
          ⚠️ Copy and paste is not allowed in this assignment.
        </div>
      )}

      {/* Assignment header */}
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            color: "rgba(148,163,184,0.5)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 3,
            fontFamily: FONT_SANS,
          }}
        >
          {assignment.unit}
        </div>
        <h2
          style={{
            color: "#fff",
            fontSize: 19,
            margin: "0 0 5px",
            fontFamily: FONT_SERIF,
          }}
        >
          {assignment.title}
        </h2>
        <p
          style={{
            color: "rgba(148,163,184,0.7)",
            fontSize: 13,
            margin: 0,
            lineHeight: 1.6,
            fontFamily: FONT_SANS,
          }}
        >
          {assignment.instructions}
        </p>
      </div>

      {/* Question tabs */}
      <div style={{ display: "flex", gap: 7, marginBottom: 16 }}>
        {assignment.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveQuestionIndex(index)}
            style={{
              flex: 1,
              padding: "9px 5px",
              borderRadius: 10,
              border:
                activeQuestionIndex === index
                  ? "1px solid rgba(59,130,246,0.45)"
                  : "1px solid rgba(255,255,255,0.07)",
              background:
                activeQuestionIndex === index
                  ? "rgba(59,130,246,0.14)"
                  : "rgba(255,255,255,0.03)",
              color:
                activeQuestionIndex === index
                  ? "#60a5fa"
                  : "rgba(148,163,184,0.55)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: activeQuestionIndex === index ? 600 : 400,
              fontFamily: FONT_SANS,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            {questionCompletionFlags[index] && (
              <span style={{ color: "#34d399" }}>✓</span>
            )}
            Q{index + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <div style={{ ...CARD_STYLE, overflow: "hidden", marginBottom: 13 }}>
        {/* Question type label */}
        <div
          style={{
            padding: "12px 19px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span
            style={{
              background:
                currentQuestion.type === "multiple_choice"
                  ? "rgba(251,191,36,0.13)"
                  : currentQuestion.type === "short_answer"
                  ? "rgba(59,130,246,0.13)"
                  : "rgba(99,102,241,0.13)",
              color:
                currentQuestion.type === "multiple_choice"
                  ? "#fbbf24"
                  : currentQuestion.type === "short_answer"
                  ? "#60a5fa"
                  : "#a78bfa",
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              letterSpacing: "0.07em",
              fontFamily: FONT_SANS,
            }}
          >
            {currentQuestion.type === "multiple_choice"
              ? "MULTIPLE CHOICE"
              : currentQuestion.type === "short_answer"
              ? "SHORT ANSWER"
              : "JOURNAL"}
          </span>
        </div>

        <div style={{ padding: "17px 19px" }}>
          <p
            style={{
              color: "#e2e8f0",
              fontSize: 14,
              margin: "0 0 16px",
              lineHeight: 1.72,
              fontFamily: FONT_SERIF,
            }}
          >
            {currentQuestion.text}
          </p>

          {/* Multiple choice options */}
          {currentQuestion.type === "multiple_choice" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {currentQuestion.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  onClick={() =>
                    setAnswers((previous) => ({ ...previous, [currentQuestion.id]: optionIndex }))
                  }
                  style={{
                    padding: "10px 13px",
                    borderRadius: 9,
                    border:
                      answers[currentQuestion.id] === optionIndex
                        ? "1px solid rgba(59,130,246,0.5)"
                        : "1px solid rgba(255,255,255,0.07)",
                    background:
                      answers[currentQuestion.id] === optionIndex
                        ? "rgba(59,130,246,0.14)"
                        : "rgba(255,255,255,0.02)",
                    color:
                      answers[currentQuestion.id] === optionIndex
                        ? "#60a5fa"
                        : "rgba(203,213,225,0.8)",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: FONT_SANS,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border:
                        answers[currentQuestion.id] === optionIndex
                          ? "none"
                          : "1px solid rgba(255,255,255,0.18)",
                      background:
                        answers[currentQuestion.id] === optionIndex
                          ? "linear-gradient(135deg,#3b82f6,#6366f1)"
                          : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {answers[currentQuestion.id] === optionIndex
                      ? "✓"
                      : String.fromCharCode(65 + optionIndex)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Short answer textarea */}
          {currentQuestion.type === "short_answer" && (
            <>
              <textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(event) =>
                  setAnswers((previous) => ({
                    ...previous,
                    [currentQuestion.id]: event.target.value,
                  }))
                }
                onPaste={handlePasteAttempt}
                onCopy={handlePasteAttempt}
                placeholder={currentQuestion.placeholder}
                rows={5}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10,
                  color: "#e2e8f0",
                  fontSize: 13,
                  padding: "11px 13px",
                  fontFamily: FONT_SANS,
                  resize: "vertical",
                  outline: "none",
                  lineHeight: 1.6,
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  color: questionCompletionFlags[activeQuestionIndex]
                    ? "#34d399"
                    : "rgba(148,163,184,0.45)",
                  fontSize: 11,
                  marginTop: 5,
                  textAlign: "right",
                  fontFamily: FONT_SANS,
                }}
              >
                {wordCount(answers[currentQuestion.id] || "")} / {currentQuestion.minWords || 0} minimum words
              </div>
            </>
          )}

          {/* Journal textarea */}
          {currentQuestion.type === "journal" && (
            <>
              <textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(event) =>
                  setAnswers((previous) => ({
                    ...previous,
                    [currentQuestion.id]: event.target.value,
                  }))
                }
                onPaste={handlePasteAttempt}
                onCopy={handlePasteAttempt}
                placeholder={currentQuestion.placeholder}
                rows={7}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 10,
                  color: "#e2e8f0",
                  fontSize: 13,
                  padding: "11px 13px",
                  fontFamily: FONT_SANS,
                  resize: "vertical",
                  outline: "none",
                  lineHeight: 1.6,
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  color: questionCompletionFlags[activeQuestionIndex]
                    ? "#34d399"
                    : "rgba(148,163,184,0.45)",
                  fontSize: 11,
                  marginTop: 5,
                  textAlign: "right",
                  fontFamily: FONT_SANS,
                }}
              >
                {wordCount(answers[currentQuestion.id] || "")} / {currentQuestion.minWords || 0} minimum words
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation and submit row */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setIsTutorOpen(!isTutorOpen)}
          style={{
            padding: "10px 15px",
            borderRadius: 10,
            border: "1px solid rgba(99,102,241,0.3)",
            background: isTutorOpen
              ? "rgba(99,102,241,0.2)"
              : "rgba(99,102,241,0.09)",
            color: "#a78bfa",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONT_SANS,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          🤖 {isTutorOpen ? "Close Tutor" : "Ask for Help"}
        </button>

        <div style={{ flex: 1 }} />

        {activeQuestionIndex > 0 && (
          <button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
            style={{
              padding: "10px 13px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              color: "rgba(148,163,184,0.6)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: FONT_SANS,
            }}
          >
            ← Previous
          </button>
        )}

        {activeQuestionIndex < assignment.questions.length - 1 ? (
          <button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
            style={{
              padding: "10px 15px",
              borderRadius: 10,
              border: "none",
              background: "rgba(59,130,246,0.14)",
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT_SANS,
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isAllComplete || isSubmitting}
            style={{
              padding: "10px 19px",
              borderRadius: 10,
              border: "none",
              background: isAllComplete && !isSubmitting
                ? "linear-gradient(135deg,#3b82f6,#6366f1)"
                : "rgba(255,255,255,0.07)",
              color: isAllComplete && !isSubmitting ? "#fff" : "rgba(148,163,184,0.35)",
              fontSize: 12,
              fontWeight: 600,
              cursor: isAllComplete && !isSubmitting ? "pointer" : "not-allowed",
              fontFamily: FONT_SANS,
              boxShadow: isAllComplete && !isSubmitting
                ? "0 4px 13px rgba(59,130,246,0.3)"
                : "none",
            }}
          >
            {isSubmitting
              ? "Saving…"
              : isAllComplete
              ? "Submit Assignment ✓"
              : `${questionCompletionFlags.filter((done) => !done).length} question(s) remaining`}
          </button>
        )}
      </div>

      {/* Submit error */}
      {submitError && (
        <div
          style={{
            marginTop: 9,
            padding: "8px 12px",
            borderRadius: 9,
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.25)",
            fontSize: 12,
            color: "#f87171",
            fontFamily: FONT_SANS,
          }}
        >
          ⚠️ {submitError}
        </div>
      )}

      {/* Checklist of remaining requirements (shown on last question) */}
      {!isAllComplete && activeQuestionIndex === assignment.questions.length - 1 && (
        <div
          style={{
            marginTop: 9,
            padding: "8px 12px",
            borderRadius: 9,
            background: "rgba(251,191,36,0.07)",
            border: "1px solid rgba(251,191,36,0.18)",
            fontSize: 11,
            color: "#fbbf24",
            fontFamily: FONT_SANS,
          }}
        >
          {assignment.questions.map((q, i) =>
            !questionCompletionFlags[i] ? (
              <span key={q.id}>
                {q.type === "multiple_choice"
                  ? `· Select an answer for Q${i + 1}  `
                  : `· Minimum ${q.minWords || 0} words for Q${i + 1}  `}
              </span>
            ) : null
          )}
        </div>
      )}

      {/* AI tutor side drawer */}
      {isTutorOpen && (
        <TutorPanel
          activeQuestionIndex={activeQuestionIndex}
          questions={assignment.questions}
          onClose={() => setIsTutorOpen(false)}
        />
      )}
    </div>
  );
}
