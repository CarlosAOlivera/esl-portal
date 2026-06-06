// FlippedMgr — teacher interface for managing flipped learning material.
// Allows creating, editing, and deleting items (videos, podcasts, PDFs, websites).
// Items are grouped by status: published, scheduled, and draft.
// Each item can be linked to an assignment and has a URL with an inline preview.

import { useState, useMemo } from "react";
import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";
import {
  CONTENT_TYPES,
  todayStr,
  daysFrom,
  fmtDate,
  daysUntil,
  flippedStat,
} from "../../data/mockData";
import { supabase } from "../../lib/supabaseClient";
import Badge, { TypeChip } from "../shared/Badge";
import Field from "../shared/Field";

const EMPTY_ITEM = {
  type: "video",
  title: "",
  unit: "",
  url: "",
  description: "",
  publishDate: daysFrom(1),
  assignmentId: null,
};

function toRow(draft, id) {
  return {
    id,
    type:          draft.type,
    title:         draft.title.trim(),
    unit:          draft.unit.trim(),
    url:           draft.url.trim() || null,
    description:   draft.description.trim() || null,
    publish_date:  draft.publishDate,
    assignment_id: draft.assignmentId || null,
  };
}

export default function FlippedMgr({ flippedItems, assignments, onRefresh }) {
  const [isFormOpen,  setIsFormOpen]  = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [draft,       setDraft]       = useState(EMPTY_ITEM);
  const [showPreview, setShowPreview] = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState(null);

  // Sort all items by publish date for consistent grouping
  const sortedItems = useMemo(
    () =>
      [...flippedItems].sort((first, second) =>
        (first.publishDate || "").localeCompare(second.publishDate || "")
      ),
    [flippedItems]
  );

  const openNewForm = () => {
    setEditingId(null);
    setDraft({ ...EMPTY_ITEM, publishDate: daysFrom(1) });
    setShowPreview(false);
    setError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.id);
    setDraft({
      type:         item.type || "video",
      title:        item.title,
      unit:         item.unit,
      url:          item.url || "",
      description:  item.description,
      publishDate:  item.publishDate || "",
      assignmentId: item.assignmentId || null,
    });
    setShowPreview(false);
    setError(null);
    setIsFormOpen(true);
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Delete this material? This cannot be undone.")) return;
    const { error: err } = await supabase.from("materials").delete().eq("id", itemId);
    if (err) { console.error(err); return; }
    onRefresh();
  };

  const updateDraft = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const saveItem = async () => {
    if (!draft.title.trim() || !draft.publishDate) return;
    setSaving(true);
    setError(null);
    try {
      const id  = editingId || `f${Date.now()}`;
      const row = toRow(draft, id);
      const { error: err } = await supabase.from("materials").upsert(row);
      if (err) throw err;
      setIsFormOpen(false);
      setEditingId(null);
      onRefresh();
    } catch (err) {
      console.error("saveItem:", err);
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const statusGroups = [
    {
      key: "published",
      label: "Published — visible to students",
      items: sortedItems.filter(
        (item) => flippedStat(item.publishDate) === "published"
      ),
    },
    {
      key: "scheduled",
      label: "Scheduled",
      items: sortedItems.filter(
        (item) => flippedStat(item.publishDate) === "scheduled"
      ),
    },
    {
      key: "draft",
      label: "Drafts",
      items: sortedItems.filter(
        (item) => flippedStat(item.publishDate) === "draft"
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 22,
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
            Flipped Material
          </h2>
          <p
            style={{
              color: "rgba(148,163,184,0.5)",
              fontSize: 13,
              margin: 0,
              fontFamily: FONT_SANS,
            }}
          >
            Students see today's material and previous items — available for review
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
            flexShrink: 0,
          }}
        >
          + New Material
        </button>
      </div>

      {/* Create / edit form */}
      {isFormOpen && (
        <div
          style={{
            ...CARD_STYLE,
            padding: "21px",
            marginBottom: 20,
            borderColor: "rgba(99,102,241,0.25)",
            background: "rgba(99,102,241,0.05)",
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
            {editingId ? "Edit" : "New material"}
          </div>

          {/* Content type selector */}
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                color: "rgba(148,163,184,0.6)",
                fontSize: 11,
                marginBottom: 7,
                fontFamily: FONT_SANS,
              }}
            >
              Content type
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {Object.entries(CONTENT_TYPES).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => updateDraft("type", key)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 9,
                    border:
                      draft.type === key
                        ? `1px solid ${config.color}44`
                        : "1px solid rgba(255,255,255,0.1)",
                    background:
                      draft.type === key
                        ? `${config.color}15`
                        : "rgba(255,255,255,0.03)",
                    color:
                      draft.type === key
                        ? config.color
                        : "rgba(148,163,184,0.6)",
                    fontSize: 12,
                    fontWeight: draft.type === key ? 700 : 400,
                    cursor: "pointer",
                    fontFamily: FONT_SANS,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </button>
              ))}
            </div>
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
            label="Description / instructions"
            value={draft.description}
            onChange={(value) => updateDraft("description", value)}
            type="textarea"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {/* Publish date */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  color: "rgba(148,163,184,0.6)",
                  fontSize: 11,
                  marginBottom: 5,
                  fontFamily: FONT_SANS,
                }}
              >
                Publish date
              </div>
              <input
                type="date"
                value={draft.publishDate}
                onChange={(event) => updateDraft("publishDate", event.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 9,
                  color: "#e2e8f0",
                  fontSize: 13,
                  padding: "10px 13px",
                  fontFamily: FONT_SANS,
                  outline: "none",
                  boxSizing: "border-box",
                  colorScheme: "dark",
                }}
              />
              {draft.publishDate && (
                <div
                  style={{
                    color:
                      draft.publishDate <= todayStr() ? "#34d399" : "#a78bfa",
                    fontSize: 11,
                    marginTop: 4,
                    fontFamily: FONT_SANS,
                  }}
                >
                  {draft.publishDate < todayStr()
                    ? "⚠️ Past date"
                    : draft.publishDate === todayStr()
                    ? "✓ Today"
                    : `◷ ${daysUntil(draft.publishDate)}`}
                </div>
              )}
            </div>

            {/* Link to assignment */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  color: "rgba(148,163,184,0.6)",
                  fontSize: 11,
                  marginBottom: 5,
                  fontFamily: FONT_SANS,
                }}
              >
                Link to assignment (optional)
              </div>
              <select
                value={draft.assignmentId || ""}
                onChange={(event) =>
                  updateDraft("assignmentId", event.target.value || null)
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
                <option value="">— No assignment —</option>
                {assignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* URL input + optional preview toggle */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                color: "rgba(148,163,184,0.6)",
                fontSize: 11,
                marginBottom: 5,
                fontFamily: FONT_SANS,
              }}
            >
              {CONTENT_TYPES[draft.type]?.urlLabel}
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              <input
                value={draft.url}
                onChange={(event) => updateDraft("url", event.target.value)}
                placeholder={CONTENT_TYPES[draft.type]?.ph}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 9,
                  color: "#e2e8f0",
                  fontSize: 13,
                  padding: "10px 13px",
                  fontFamily: FONT_SANS,
                  outline: "none",
                }}
              />
              {draft.url &&
                (draft.type === "video" || draft.type === "podcast") && (
                  <button
                    onClick={() => setShowPreview((current) => !current)}
                    style={{
                      padding: "10px 13px",
                      borderRadius: 9,
                      border: "1px solid rgba(99,102,241,0.3)",
                      background: "rgba(99,102,241,0.1)",
                      color: "#a78bfa",
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: FONT_SANS,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {showPreview ? "Hide" : "Preview"}
                  </button>
                )}
            </div>
          </div>

          {/* Inline preview */}
          {showPreview && draft.url && draft.type === "video" && (
            <div
              style={{
                borderRadius: 11,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.07)",
                aspectRatio: "16/9",
                marginBottom: 12,
              }}
            >
              <iframe
                src={draft.url.replace("watch?v=", "embed/")}
                style={{ width: "100%", height: "100%", border: "none" }}
                allowFullScreen
                title="preview"
              />
            </div>
          )}
          {showPreview && draft.url && draft.type === "podcast" && (
            <div
              style={{
                background: "rgba(34,211,238,0.06)",
                border: "1px solid rgba(34,211,238,0.2)",
                borderRadius: 11,
                padding: "14px 18px",
                marginBottom: 12,
              }}
            >
              <audio controls style={{ width: "100%", accentColor: "#22d3ee" }}>
                <source src={draft.url} />
              </audio>
            </div>
          )}

          {/* Form actions */}
          {error && (
            <p style={{ color: "#f87171", fontSize: 12, margin: "0 0 10px", fontFamily: FONT_SANS }}>⚠️ {error}</p>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => { setIsFormOpen(false); setEditingId(null); }}
              style={{ padding: "8px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(148,163,184,0.6)", fontSize: 12, cursor: "pointer", fontFamily: FONT_SANS }}
            >
              Cancel
            </button>
            <button
              onClick={saveItem}
              disabled={!draft.title || !draft.publishDate || saving}
              style={{
                padding: "8px 16px", borderRadius: 9, border: "none",
                background: draft.title && draft.publishDate && !saving ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.07)",
                color: draft.title && draft.publishDate && !saving ? "#fff" : "rgba(148,163,184,0.4)",
                fontSize: 12, fontWeight: 600,
                cursor: draft.title && draft.publishDate && !saving ? "pointer" : "not-allowed",
                fontFamily: FONT_SANS,
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Grouped item lists */}
      {statusGroups.map((group) =>
        group.items.length === 0 ? null : (
          <div key={group.key} style={{ marginBottom: 26 }}>
            <div
              style={{
                color: "rgba(148,163,184,0.45)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 9,
                fontFamily: FONT_SANS,
              }}
            >
              {group.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {group.items.map((item) => {
                const itemStatus      = flippedStat(item.publishDate);
                const linkedAssignment = assignments.find(
                  (assignment) => assignment.id === item.assignmentId
                );
                const dayNumber = item.publishDate
                  ? new Date(item.publishDate + "T12:00:00").getDate()
                  : "—";
                const monthLabel = item.publishDate
                  ? new Date(item.publishDate + "T12:00:00")
                      .toLocaleDateString("en-US", { month: "short" })
                      .toUpperCase()
                  : "NO DATE";

                return (
                  <div
                    key={item.id}
                    style={{
                      ...CARD_STYLE,
                      padding: "15px 19px",
                      display: "flex",
                      alignItems: "center",
                      gap: 13,
                    }}
                  >
                    {/* Date column */}
                    <div
                      style={{
                        flexShrink: 0,
                        width: 72,
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          color:
                            itemStatus === "published"
                              ? "#34d399"
                              : itemStatus === "scheduled"
                              ? "#a78bfa"
                              : "rgba(148,163,184,0.4)",
                          fontSize: 18,
                          fontWeight: 700,
                          fontFamily: FONT_SERIF,
                          lineHeight: 1,
                        }}
                      >
                        {dayNumber}
                      </div>
                      <div
                        style={{
                          color: "rgba(148,163,184,0.5)",
                          fontSize: 10,
                          fontFamily: FONT_SANS,
                        }}
                      >
                        {monthLabel}
                      </div>
                      {itemStatus === "scheduled" && (
                        <div
                          style={{
                            color: "#a78bfa",
                            fontSize: 10,
                            fontFamily: FONT_SANS,
                            marginTop: 2,
                          }}
                        >
                          {daysUntil(item.publishDate)}
                        </div>
                      )}
                      {itemStatus === "published" && (
                        <div
                          style={{
                            color: "#34d399",
                            fontSize: 10,
                            fontFamily: FONT_SANS,
                            marginTop: 2,
                          }}
                        >
                          visible
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div
                      style={{
                        width: 1,
                        height: 46,
                        background: "rgba(255,255,255,0.07)",
                        flexShrink: 0,
                      }}
                    />

                    {/* Item details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          marginBottom: 4,
                          flexWrap: "wrap",
                        }}
                      >
                        <Badge status={itemStatus} />
                        <TypeChip type={item.type} />
                        <span
                          style={{
                            color: "rgba(148,163,184,0.4)",
                            fontSize: 11,
                            fontFamily: FONT_SANS,
                          }}
                        >
                          {item.unit}
                        </span>
                        {linkedAssignment && (
                          <span
                            style={{
                              background: "rgba(59,130,246,0.12)",
                              color: "#60a5fa",
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 20,
                              fontFamily: FONT_SANS,
                            }}
                          >
                            🔗 {linkedAssignment.title}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: FONT_SERIF,
                          marginBottom: 2,
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          color: "rgba(148,163,184,0.5)",
                          fontSize: 12,
                          fontFamily: FONT_SANS,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.description}
                      </div>
                    </div>

                    {/* Edit / delete buttons */}
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => openEditForm(item)}
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
                        onClick={() => deleteItem(item.id)}
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
        )
      )}
    </div>
  );
}
