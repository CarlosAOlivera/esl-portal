// AssignmentsMgr — teacher interface for creating and managing assignments.
// All CRUD operations persist to Supabase; onRefresh re-fetches from the parent.

import { useState } from "react";
import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";
import { CONTENT_TYPES, fmtDate } from "../../data/mockData";
import { supabase } from "../../lib/supabaseClient";
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
  correctIndex: null,
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

// ── Supabase row converters ───────────────────────────────────────────────────

function toRow(draft, id) {
  return {
    id,
    title:        draft.title.trim(),
    unit:         draft.unit.trim(),
    instructions: draft.instructions.trim(),
    status:       draft.status,
    flipped_id:   draft.flippedId || null,
    questions:    draft.questions,
    updated_at:   new Date().toISOString(),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AssignmentsMgr({ assignments, flippedItems, onRefresh }) {
  const [isFormOpen,          setIsFormOpen]          = useState(false);
  const [editingId,           setEditingId]           = useState(null);
  const [draft,               setDraft]               = useState(EMPTY_ASSIGNMENT);
  const [questionForm,        setQuestionForm]        = useState(EMPTY_QUESTION);
  const [isQuestionFormOpen,  setIsQuestionFormOpen]  = useState(false);
  const [saving,              setSaving]              = useState(false);
  const [error,               setError]               = useState(null);

  const updateDraft        = (key, value) => setDraft((c) => ({ ...c, [key]: value }));
  const updateQuestionForm = (key, value) => setQuestionForm((c) => ({ ...c, [key]: value }));
  const updateOption       = (i, value)   => setQuestionForm((c) => {
    const opts = [...c.options]; opts[i] = value; return { ...c, options: opts };
  });

  const addQuestion = () => {
    if (!questionForm.text.trim()) return;
    const q = {
      id:   `q${Date.now()}`,
      type: questionForm.type,
      text: questionForm.text,
      ...(questionForm.type === "multiple_choice"
        ? { options: questionForm.options.map((o) => o.trim()).filter(Boolean), correctIndex: questionForm.correctIndex }
        : { placeholder: "Write your answer here...", minWords: questionForm.minWords }),
    };
    updateDraft("questions", [...draft.questions, q]);
    setQuestionForm(EMPTY_QUESTION);
    setIsQuestionFormOpen(false);
  };

  const removeQuestion = (i) =>
    updateDraft("questions", draft.questions.filter((_, idx) => idx !== i));

  // ── Supabase mutations ──────────────────────────────────────────────────────

  const saveAssignment = async () => {
    if (!draft.title.trim() || !draft.unit.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const id  = editingId || `a${Date.now()}`;
      const row = toRow(draft, id);
      const { error: err } = await supabase.from("assignments").upsert(row);
      if (err) throw err;
      setIsFormOpen(false);
      setEditingId(null);
      onRefresh();
    } catch (err) {
      console.error("saveAssignment:", err);
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAssignment = async (id) => {
    if (!window.confirm("Delete this assignment? This cannot be undone.")) return;
    const { error: err } = await supabase.from("assignments").delete().eq("id", id);
    if (err) { console.error(err); return; }
    onRefresh();
  };

  const togglePublished = async (assignment) => {
    const newStatus = assignment.status === "published" ? "draft" : "published";
    const { error: err } = await supabase
      .from("assignments")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", assignment.id);
    if (err) { console.error(err); return; }
    onRefresh();
  };

  // ── Form helpers ────────────────────────────────────────────────────────────

  const openNewForm = () => {
    setEditingId(null);
    setDraft(EMPTY_ASSIGNMENT);
    setIsQuestionFormOpen(false);
    setQuestionForm(EMPTY_QUESTION);
    setError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (a) => {
    setEditingId(a.id);
    setDraft({
      title:        a.title,
      unit:         a.unit,
      instructions: a.instructions,
      status:       a.status,
      flippedId:    a.flippedId || null,
      questions:    a.questions || [],
    });
    setIsQuestionFormOpen(false);
    setQuestionForm(EMPTY_QUESTION);
    setError(null);
    setIsFormOpen(true);
  };

  // ── Styles ──────────────────────────────────────────────────────────────────

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

  const canSave = draft.title.trim() && draft.unit.trim();

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ color: "#fff", fontSize: 20, margin: "0 0 3px", fontFamily: FONT_SERIF }}>
            Assignments
          </h2>
          <p style={{ color: "rgba(148,163,184,0.5)", fontSize: 13, margin: 0, fontFamily: FONT_SANS }}>
            {assignments.length} assignment(s)
          </p>
        </div>
        <button
          onClick={openNewForm}
          style={{
            padding: "10px 16px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: FONT_SANS, display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 4px 13px rgba(99,102,241,0.3)",
          }}
        >
          + New Assignment
        </button>
      </div>

      {/* Create / Edit form */}
      {isFormOpen && (
        <div
          style={{
            ...CARD_STYLE, padding: "21px", marginBottom: 16,
            borderColor: "rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.06)",
          }}
        >
          <div style={{ color: "#a78bfa", fontSize: 13, fontWeight: 700, marginBottom: 14, fontFamily: FONT_SANS }}>
            {editingId ? "Edit Assignment" : "New Assignment"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Title" value={draft.title} onChange={(v) => updateDraft("title", v)} />
            <Field label="Unit / Week" value={draft.unit} onChange={(v) => updateDraft("unit", v)} />
          </div>

          <Field
            label="Instructions for students"
            value={draft.instructions}
            onChange={(v) => updateDraft("instructions", v)}
            type="textarea"
          />

          {/* Link to flipped material */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "rgba(148,163,184,0.6)", fontSize: 11, marginBottom: 5, fontFamily: FONT_SANS }}>
              Link to flipped material
            </div>
            <select
              value={draft.flippedId || ""}
              onChange={(e) => updateDraft("flippedId", e.target.value || null)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">— No material linked —</option>
              {flippedItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {CONTENT_TYPES[item.type]?.icon} {item.title} ({fmtDate(item.publishDate)})
                </option>
              ))}
            </select>
            {draft.flippedId && (
              <div style={{ color: "#60a5fa", fontSize: 11, marginTop: 4, fontFamily: FONT_SANS }}>
                🔗 {flippedItems.find((i) => i.id === draft.flippedId)?.title}
              </div>
            )}
          </div>

          {/* Question builder */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "rgba(148,163,184,0.6)", fontSize: 11, marginBottom: 8, fontFamily: FONT_SANS }}>
              Questions
            </div>

            {draft.questions.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
                {draft.questions.map((q, i) => (
                  <div
                    key={q.id}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 13px", borderRadius: 9,
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <span style={{ color: "rgba(148,163,184,0.5)", fontSize: 11, fontFamily: FONT_SANS, flexShrink: 0, paddingTop: 1 }}>
                      Q{i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          background: q.type === "multiple_choice" ? "rgba(251,191,36,0.13)" : q.type === "short_answer" ? "rgba(59,130,246,0.13)" : "rgba(99,102,241,0.13)",
                          color: q.type === "multiple_choice" ? "#fbbf24" : q.type === "short_answer" ? "#60a5fa" : "#a78bfa",
                          fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                          fontFamily: FONT_SANS, marginRight: 7,
                        }}
                      >
                        {q.type === "multiple_choice" ? "MULTIPLE CHOICE" : q.type === "short_answer" ? "SHORT ANSWER" : "JOURNAL"}
                      </span>
                      <span style={{ color: "#cbd5e1", fontSize: 12, fontFamily: FONT_SANS }}>{q.text}</span>
                    </div>
                    <button
                      onClick={() => removeQuestion(i)}
                      style={{ background: "none", border: "none", color: "rgba(248,113,113,0.6)", cursor: "pointer", fontSize: 18, padding: "0 2px", lineHeight: 1, flexShrink: 0 }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}

            {isQuestionFormOpen ? (
              <div style={{ padding: "14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)" }}>
                {/* Type selector */}
                <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
                  {QUESTION_TYPES.map((qt) => (
                    <button
                      key={qt.id}
                      onClick={() => updateQuestionForm("type", qt.id)}
                      style={{
                        padding: "6px 12px", borderRadius: 8,
                        border: questionForm.type === qt.id ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)",
                        background: questionForm.type === qt.id ? "rgba(99,102,241,0.15)" : "transparent",
                        color: questionForm.type === qt.id ? "#a78bfa" : "rgba(148,163,184,0.55)",
                        fontSize: 11, fontWeight: questionForm.type === qt.id ? 700 : 400,
                        cursor: "pointer", fontFamily: FONT_SANS,
                      }}
                    >
                      {qt.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={questionForm.text}
                  onChange={(e) => updateQuestionForm("text", e.target.value)}
                  placeholder="Question text..."
                  rows={2}
                  style={{ ...inputStyle, marginBottom: 10, resize: "vertical", lineHeight: 1.5 }}
                />

                {questionForm.type === "multiple_choice" && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ color: "rgba(52,211,153,0.55)", fontSize: 10, fontFamily: FONT_SANS, marginBottom: 6 }}>
                      Click the letter to mark the correct answer
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {["A","B","C","D"].map((letter, i) => (
                        <div key={letter} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => updateQuestionForm("correctIndex", questionForm.correctIndex === i ? null : i)}
                            title="Mark as correct answer"
                            style={{
                              width: 22, height: 22, borderRadius: "50%",
                              background: questionForm.correctIndex === i ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.06)",
                              border: questionForm.correctIndex === i ? "1px solid rgba(52,211,153,0.6)" : "1px solid rgba(255,255,255,0.12)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, fontWeight: 700,
                              color: questionForm.correctIndex === i ? "#34d399" : "rgba(148,163,184,0.7)",
                              flexShrink: 0, fontFamily: FONT_SANS, cursor: "pointer", padding: 0,
                            }}
                          >
                            {questionForm.correctIndex === i ? "✓" : letter}
                          </button>
                          <input value={questionForm.options[i]} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${letter}`} style={inputStyle} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(questionForm.type === "short_answer" || questionForm.type === "journal") && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ color: "rgba(148,163,184,0.6)", fontSize: 11, fontFamily: FONT_SANS, whiteSpace: "nowrap" }}>Minimum words</span>
                    <input type="number" min={10} max={500} value={questionForm.minWords} onChange={(e) => updateQuestionForm("minWords", Number(e.target.value))} style={{ ...inputStyle, width: 80 }} />
                  </div>
                )}

                <div style={{ display: "flex", gap: 7 }}>
                  <button onClick={() => { setIsQuestionFormOpen(false); setQuestionForm(EMPTY_QUESTION); }} style={{ padding: "7px 13px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(148,163,184,0.6)", fontSize: 11, cursor: "pointer", fontFamily: FONT_SANS }}>Cancel</button>
                  <button onClick={addQuestion} disabled={!questionForm.text.trim()} style={{ padding: "7px 13px", borderRadius: 8, border: "none", background: questionForm.text.trim() ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.07)", color: questionForm.text.trim() ? "#fff" : "rgba(148,163,184,0.4)", fontSize: 11, fontWeight: 600, cursor: questionForm.text.trim() ? "pointer" : "not-allowed", fontFamily: FONT_SANS }}>Add Question</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsQuestionFormOpen(true)} style={{ padding: "8px 14px", borderRadius: 9, border: "1px dashed rgba(99,102,241,0.35)", background: "transparent", color: "rgba(167,139,250,0.7)", fontSize: 12, cursor: "pointer", fontFamily: FONT_SANS, display: "flex", alignItems: "center", gap: 6 }}>
                + Add Question
              </button>
            )}
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: 12, margin: "0 0 10px", fontFamily: FONT_SANS }}>⚠️ {error}</p>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => { setIsFormOpen(false); setEditingId(null); }} style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(148,163,184,0.6)", fontSize: 12, cursor: "pointer", fontFamily: FONT_SANS }}>Cancel</button>
            <button
              onClick={saveAssignment}
              disabled={!canSave || saving}
              style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: canSave && !saving ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.07)", color: canSave && !saving ? "#fff" : "rgba(148,163,184,0.4)", fontSize: 12, fontWeight: 600, cursor: canSave && !saving ? "pointer" : "not-allowed", fontFamily: FONT_SANS }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Assignment list */}
      {assignments.length === 0 ? (
        <div style={{ ...CARD_STYLE, padding: "48px 32px", textAlign: "center", color: "rgba(148,163,184,0.4)", fontFamily: FONT_SANS, fontSize: 14 }}>
          No assignments yet. Create your first one above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {assignments.map((a) => {
            const linked = flippedItems.find((i) => i.id === a.flippedId);
            return (
              <div key={a.id} style={{ ...CARD_STYLE, padding: "16px 20px", display: "flex", alignItems: "center", gap: 13 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, flexWrap: "wrap" }}>
                    <Badge status={a.status} />
                    <span style={{ color: "rgba(148,163,184,0.4)", fontSize: 11, fontFamily: FONT_SANS }}>{a.unit}</span>
                    {linked && (
                      <span style={{ background: "rgba(99,102,241,0.12)", color: "#a78bfa", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, fontFamily: FONT_SANS }}>
                        {CONTENT_TYPES[linked.type]?.icon} {linked.title}
                      </span>
                    )}
                  </div>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, fontFamily: FONT_SERIF }}>{a.title}</div>
                  <div style={{ color: "rgba(148,163,184,0.5)", fontSize: 12, marginTop: 2, fontFamily: FONT_SANS }}>
                    {a.questions?.length || 0} questions
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => togglePublished(a)} style={{ padding: "6px 11px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(148,163,184,0.7)", fontSize: 11, cursor: "pointer", fontFamily: FONT_SANS }}>
                    {a.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => openEditForm(a)} style={{ padding: "6px 11px", borderRadius: 8, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", color: "#a78bfa", fontSize: 11, cursor: "pointer", fontFamily: FONT_SANS }}>Edit</button>
                  <button onClick={() => deleteAssignment(a.id)} style={{ padding: "6px 11px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)", color: "#f87171", fontSize: 11, cursor: "pointer", fontFamily: FONT_SANS }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
