// AssignmentsMgr — teacher interface for creating and managing assignments.
// Assignments can be linked to a flipped material item and toggled between
// draft and published. Published assignments become visible to students.

import { useState } from "react";
import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";
import { CONTENT_TYPES, fmtDate } from "../../data/mockData";
import Badge from "../shared/Badge";
import Field from "../shared/Field";

const EMPTY_ASSIGNMENT = {
  title: "",
  unit: "",
  instructions: "",
  status: "draft",
  flippedId: null,
};

export default function AssignmentsMgr({ assignments, setAssignments, flippedItems }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [draft, setDraft]           = useState(EMPTY_ASSIGNMENT);

  const updateDraft = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));

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
    });
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
        { ...draft, id: `a${Date.now()}`, questions: [] },
      ]);
    }
    setIsFormOpen(false);
    setEditingId(null);
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
            Asignaciones
          </h2>
          <p
            style={{
              color: "rgba(148,163,184,0.5)",
              fontSize: 13,
              margin: 0,
              fontFamily: FONT_SANS,
            }}
          >
            {assignments.length} asignación(es)
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
          + Nueva asignación
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
            {editingId ? "Editar" : "Nueva asignación"}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field
              label="Título"
              value={draft.title}
              onChange={(value) => updateDraft("title", value)}
            />
            <Field
              label="Unidad / Semana"
              value={draft.unit}
              onChange={(value) => updateDraft("unit", value)}
            />
          </div>

          <Field
            label="Instrucciones para el estudiante"
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
              Ligar a material flipped
            </div>
            <select
              value={draft.flippedId || ""}
              onChange={(event) =>
                updateDraft("flippedId", event.target.value || null)
              }
              style={{
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
                cursor: "pointer",
              }}
            >
              <option value="">— Sin material ligado —</option>
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
                {
                  flippedItems.find((item) => item.id === draft.flippedId)
                    ?.title
                }
              </div>
            )}
          </div>

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
              Cancelar
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
              Guardar
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
                  {assignment.questions?.length || 0} preguntas
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
                  {assignment.status === "published" ? "Despublicar" : "Publicar"}
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
                  Editar
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
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
