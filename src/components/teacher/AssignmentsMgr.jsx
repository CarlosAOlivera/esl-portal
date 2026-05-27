// AssignmentsMgr — teacher interface for creating and managing assignments.
// Assignments can be linked to a flipped material item and toggled between
// draft and published. Published assignments become visible to students.
// Includes a question builder for adding multiple choice, short answer, and journal questions.

import { useState } from "react";
import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";
import { CONTENT_TYPES, fmtDate } from "../../data/mockData";
import Badge from "../shared/Badge";
import Field from "../shared/Field";

const QUESTION_TYPES = [
  { id: "multiple_choice", label: "Multiple Choice" },
  { id: "short_answer",    label: "Short Answer" },
  { id: "journal",         label: "Journal" },
];

const EMPTY_QUESTION = {
  type: "multiple_choice",
  text: "",
  options: ["", "", "", ""],
  minWords: 30,
};

const EMPTY_ASSIGNMENT = {
  title: "",
  unit: "",
  instructions: "",
  status: "draft",
  flippedId: null,
  questions: [],
};

export default function AssignmentsMgr({ assignments, setAssignments, flippedItems }) {
  const [isFormOpen, setIsFormOpen]               = useState(false);
  const [editingId, setEditingId]                 = useState(null);
  const [draft, setDraft]                         = useState(EMPTY_ASSIGNMENT);
  const [questionForm, setQuestionForm]           = useState(EMPTY_QUESTION);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);

  const updateDraft = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const updateQuestionForm = (key, value) =>
    setQuestionForm((current) => ({ ...current, [key]: value }));

  const updateOption = (index, value) =>
    setQuestionForm((current) => {
      const options = [...current.options];
      options[index] = value;
      return { ...current, options };
    });

  const addQuestion = () => {
    if (!questionForm.text.trim()) return;
    const newQuestion = {
      id: `q${Date.now()}`,
      type: questionForm.type,
      text: questionForm.text,
      ...(questionForm.type === "multiple_choice"
        ? { options: questionForm.options.map((o) => o.trim()).filter(Boolean) }
        : { placeholder: "Write your answer here...", minWords: questionForm.minWords }),
    };
    updateDraft("questions", [...draft.questions, newQuestion]);
    setQuestionForm(EMPTY_QUESTION);
    setIsQuestionFormOpen(false);
  };

  const removeQuestion = (index) =>
    updateDraft("questions", draft.questions.filter((_, i) => i !== index));

  const deleteAssignment = (assignmentId) =>
    setAssignments((items) => items.filter((item) => item.id !== assignmentId));

  const togglePublished = (assignmentId) =>
    setAssignments((items) =>
      items.map((item) =>
        item.id === assignmentId
          ? { ...item, status: item.status === "published" ? "draft" : "published" }
          : item
      )
    );

  const openNewForm = () => {
    setEditingId(null);
    setDraft(EMPTY_ASSIGNMENT);
    setIsQuestionFormOpen(false);
    setQuestionForm(EMPTY_QUESTION);
    setIsFormOpen(true);
  };

  const openEditForm = (assignment) => {
    setEditingId(assignment.id);
    setDraft({
      title: assignment.title,
      unit: assignment.unit,
      instructions: assignment.instructions,
      status: assignment.status,
      flippedId: assignment.flippedId || null,
      questions: assignment.questions || [],
    });
    setIsQuestionFormOpen(false);
    setQuestionForm(EMPTY_QUESTION);
    setIsFormOpen(true);
  };

  const saveAssignment = () => {
    if (editingId) {
      setAssignments((items) =>
        items.map((item) =>
          item.id === editingId ? { ...item, ...draft } : item
        )
      );
    } else {
      setAssignments((items) => [
        ...items,
        { ...draft, id: `a${Date.now()}` },
      ]);
    }
    setIsFormOpen(false);
    setEditingId(null);
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(20,30,50,0.9)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 9,
    color: "#e2e8f0",
    fontSize: 13,
    padding: "10px 13px",
    fontFamily: FONT_SANS,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px" }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              color: "#fff",
              fontSize: 20,
              margin: "0 0 3px",
              fontFamily: FONT_SERIF,
            }}
          >
            Assignments
          </h2>
          <p
            style={{
              color: "rgba(148,163,184,0.5)",
              fontSize: 13,
              margin: 0,
              fontFamily: FONT_SANS,
            }}
          >
            {assignments.length} assignment(s)
          </p>
        </div>
        <button
          onClick={openNewForm}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONT_SANS,
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 4px 13px rgba(99,102,241,0.3)",
          }}
        >
          + New Assignment
        </button>
      </div>

      {/* Create / edit form */}
      {isFormOpen && (
        <div
          style={{
            ...CARD_STYLE,
            padding: "21px",
            marginBottom: 16,
            borderColor: "rgba(99,102,241,0.25)",
            background: "rgba(99,102,241,0.06)",
          }}
        >
          <div
            style={{
              color: "#a78bfa",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 14,
              fontFamily: FONT_SANS,
            }}
          >
            {editingId ? "Edit" : "New Assignment"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field
              label="Title"
              value={draft.title}
              onChange={(value) => updateDraft("title", value)}
            />
            <Field
              label="Unit / Week"
              value={draft.unit}
              onChange={(value) => updateDraft("unit", value)}
            />
          </div>

          <Field
            label="Instructions for students"
            value={draft.instructions}
            onChange={(value) => updateDraft("instructions", value)}
            type="textarea"
          />

          {/* Link to flipped material */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                color: "rgba(148,163,184,0.6)",
                fontSize: 11,
                marginBottom: 5,
                fontFamily: FONT_SANS,
              }}
            >
              Link to flipped material
            </div>
            <select
              value={draft.flippedId || ""}
              onChange={(event) =>
                updateDraft("flippedId", event.target.value || null)
              }
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">— No material linked —</option>
              {flippedItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {CONTENT_TYPES[item.type]?.icon} {item.title} (
                  {fmtDate(item.publishDate)})
                </option>
              ))}
            </select>
            {draft.flippedId && (
              <div
                style={{
                  color: "#60a5fa",
                  fontSize: 11,
                  marginTop: 4,
                  fontFamily: FONT_SANS,
                }}
              >
                🔗{" "}
                {flippedItems.find((item) => item.id === draft.flippedId)?.title}
              </div>
            )}
          </div>

          {/* ── Question builder ─────────────────────────────────────────────── */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                color: "rgba(148,163,184,0.6)",
                fontSize: 11,
                marginBottom: 8,
                fontFamily: FONT_SANS,
              }}
            >
              Questions
            </div>

            {/* Existing questions list */}
            {draft.questions.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
                {draft.questions.map((question, index) => (
                  <div
                    key={question.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 13px",
                      borderRadius: 9,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <span
                      style={{
                        color: "rgba(148,163,184,0.5)",
                        fontSize: 11,
                        fontFamily: FONT_SANS,
                        flexShrink: 0,
                        paddingTop: 1,
                      }}
                    >
                      Q{index + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          background:
                            question.type === "multiple_choice"
                              ? "rgba(251,191,36,0.13)"
                              : question.type === "short_answer"
                              ? "rgba(59,130,246,0.13)"
                              : "rgba(99,102,241,0.13)",
                          color:
                            question.type === "multiple_choice"
                              ? "#fbbf24"
                              : question.type === "short_answer"
                              ? "#60a5fa"
                              : "#a78bfa",
                          fontSize: 9,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontFamily: FONT_SANS,
                          marginRight: 7,
                        }}
                      >
                        {question.type === "multiple_choice"
                          ? "MULTIPLE CHOICE"
                          : question.type === "short_answer"
                          ? "SHORT ANSWER"
                          : "JOURNAL"}
                      </span>
                      <span
                        style={{
                          color: "#cbd5e1",
                          fontSize: 12,
                          fontFamily: FONT_SANS,
                        }}
                      >
                        {question.text}
                      </span>
                    </div>
                    <button
                      onClick={() => removeQuestion(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(248,113,113,0.6)",
                        cursor: "pointer",
                        fontSize: 18,
                        padding: "0 2px",
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add question form */}
            {isQuestionFormOpen ? (
              <div
                style={{
                  padding: "14px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                {/* Type selector */}
                <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
                  {QUESTION_TYPES.map((qt) => (
                    <button
                      key={qt.id}
                      onClick={() => updateQuestionForm("type", qt.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border:
                          questionForm.type === qt.id
                            ? "1px solid rgba(99,102,241,0.5)"
                            : "1px solid rgba(255,255,255,0.08)",
                        background:
                          questionForm.type === qt.id
                            ? "rgba(99,102,241,0.15)"
                            : "transparent",
                        color:
                          questionForm.type === qt.id
                            ? "#a78bfa"
                            : "rgba(148,163,184,0.55)",
                        fontSize: 11,
                        fontWeight: questionForm.type === qt.id ? 700 : 400,
                        cursor: "pointer",
                        fontFamily: FONT_SANS,
                      }}
                    >
                      {qt.label}
                    </button>
                  ))}
                </div>

                {/* Question text */}
                <textarea
                  value={questionForm.text}
                  onChange={(event) => updateQuestionForm("text", event.target.value)}
                  placeholder="Question text..."
                  rows={2}
                  style={{
                    ...inputStyle,
                    marginBottom: 10,
                    resize: "vertical",
                    lineHeight: 1.5,
                  }}
                />

                {/* Multiple choice: 4 option fields */}
                {questionForm.type === "multiple_choice" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
                    {["A", "B", "C", "D"].map((letter, index) => (
                      <div key={letter} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "rgba(148,163,184,0.7)",
                            flexShrink: 0,
                            fontFamily: FONT_SANS,
                          }}
                        >
                          {letter}
                        </span>
                        <input
                          value={questionForm.options[index]}
                          onChange={(event) => updateOption(index, event.target.value)}
                          placeholder={`Option ${letter}`}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Minimum words for short answer / journal */}
                {(questionForm.type === "short_answer" || questionForm.type === "journal") && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span
                      style={{
                        color: "rgba(148,163,184,0.6)",
                        fontSize: 11,
                        fontFamily: FONT_SANS,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Minimum words
                    </span>
                    <input
                      type="number"
                      min={10}
                      max={500}
                      value={questionForm.minWords}
                      onChange={(event) =>
                        updateQuestionForm("minWords", Number(event.target.value))
                      }
                      style={{ ...inputStyle, width: 80 }}
                    />
                  </div>
                )}

                {/* Add / Cancel buttons */}
                <div style={{ display: "flex", gap: 7 }}>
                  <button
                    onClick={() => {
                      setIsQuestionFormOpen(false);
                      setQuestionForm(EMPTY_QUESTION);
                    }}
                    style={{
                      padding: "7px 13px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "transparent",
                      color: "rgba(148,163,184,0.6)",
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: FONT_SANS,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addQuestion}
                    disabled={!questionForm.text.trim()}
                    style={{
                      padding: "7px 13px",
                      borderRadius: 8,
                      border: "none",
                      background: questionForm.text.trim()
                        ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                        : "rgba(255,255,255,0.07)",
                      color: questionForm.text.trim()
                        ? "#fff"
                        : "rgba(148,163,184,0.4)",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: questionForm.text.trim() ? "pointer" : "not-allowed",
                      fontFamily: FONT_SANS,
                    }}
                  >
                    Add Question
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsQuestionFormOpen(true)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 9,
                  border: "1px dashed rgba(99,102,241,0.35)",
                  background: "transparent",
                  color: "rgba(167,139,250,0.7)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: FONT_SANS,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                + Add Question
              </button>
            )}
          </div>

          {/* Form save / cancel */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditingId(null);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: 9,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "transparent",
                color: "rgba(148,163,184,0.6)",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: FONT_SANS,
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveAssignment}
              disabled={!draft.title || !draft.unit}
              style={{
                padding: "8px 16px",
                borderRadius: 9,
                border: "none",
                background:
                  draft.title && draft.unit
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : "rgba(255,255,255,0.07)",
                color:
                  draft.title && draft.unit
                    ? "#fff"
                    : "rgba(148,163,184,0.4)",
                fontSize: 12,
                fontWeight: 600,
                cursor: draft.title && draft.unit ? "pointer" : "not-allowed",
                fontFamily: FONT_SANS,
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Assignment list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {assignments.map((assignment) => {
          const linkedFlipped = flippedItems.find(
            (item) => item.id === assignment.flippedId
          );
          return (
            <div
              key={assignment.id}
              style={{
                ...CARD_STYLE,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 13,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    marginBottom: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <Badge status={assignment.status} />
                  <span
                    style={{
                      color: "rgba(148,163,184,0.4)",
                      fontSize: 11,
                      fontFamily: FONT_SANS,
                    }}
                  >
                    {assignment.unit}
                  </span>
                  {linkedFlipped && (
                    <span
                      style={{
                        background: "rgba(99,102,241,0.12)",
                        color: "#a78bfa",
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 20,
                        fontFamily: FONT_SANS,
                      }}
                    >
                      {CONTENT_TYPES[linkedFlipped.type]?.icon}{" "}
                      {linkedFlipped.title}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: FONT_SERIF,
                  }}
                >
                  {assignment.title}
                </div>
                <div
                  style={{
                    color: "rgba(148,163,184,0.5)",
                    fontSize: 12,
                    marginTop: 2,
                    fontFamily: FONT_SANS,
                  }}
                >
                  {assignment.questions?.length || 0} questions
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => togglePublished(assignment.id)}
                  style={{
                    padding: "6px 11px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "transparent",
                    color: "rgba(148,163,184,0.7)",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: FONT_SANS,
                  }}
                >
                  {assignment.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => openEditForm(assignment)}
                  style={{
                    padding: "6px 11px",
                    borderRadius: 8,
                    border: "1px solid rgba(99,102,241,0.3)",
                    background: "rgba(99,102,241,0.1)",
                    color: "#a78bfa",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: FONT_SANS,
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteAssignment(assignment.id)}
                  style={{
                    padding: "6px 11px",
                    borderRadius: 8,
                    border: "1px solid rgba(239,68,68,0.25)",
                    background: "rgba(239,68,68,0.08)",
                    color: "#f87171",
                    fontSize: 11,
                    cursor: "pointer",
                    fontFamily: FONT_SANS,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
