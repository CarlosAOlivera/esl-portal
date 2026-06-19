// Responses — teacher view of submitted student work.
// Fetches all student_responses from Supabase, joined with profiles for names/initials.
// The teacher can mark individual responses as reviewed; state is persisted to Supabase.

import { useState, useEffect, useCallback } from "react";
import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";
import { supabase } from "../../lib/supabaseClient";

export default function Responses({ assignments = [] }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [groupFilter, setGroupFilter] = useState("all");
  const [togglingId, setTogglingId]   = useState(null); // optimistic lock per row

  const fetchResponses = useCallback(async () => {
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
  }, []);

  useEffect(() => { fetchResponses(); }, [fetchResponses]);

  const toggleReviewed = async (response) => {
    if (togglingId === response.id) return;
    const newValue = !response.reviewed;
    setTogglingId(response.id);

    // Optimistic update
    setResponses((prev) =>
      prev.map((r) =>
        r.id === response.id
          ? { ...r, reviewed: newValue, reviewed_at: newValue ? new Date().toISOString() : null }
          : r
      )
    );

    const { error } = await supabase
      .from("student_responses")
      .update({
        reviewed:    newValue,
        reviewed_at: newValue ? new Date().toISOString() : null,
      })
      .eq("id", response.id);

    if (error) {
      console.error("Failed to update reviewed:", error);
      // Roll back
      setResponses((prev) =>
        prev.map((r) => (r.id === response.id ? { ...r, reviewed: response.reviewed } : r))
      );
    }
    setTogglingId(null);
  };

  const visibleResponses = groupFilter === "all"
    ? responses
    : responses.filter((r) => String(r.profiles?.group_number) === groupFilter);

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
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "22px 20px 48px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <h2 style={{ color: "#fff", fontFamily: FONT_SERIF, fontSize: 20, margin: 0 }}>
          Student Responses
        </h2>
        <span
          style={{
            background: "rgba(59,130,246,0.13)",
            color: "#60a5fa",
            fontSize: 12,
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 20,
            fontFamily: FONT_SANS,
          }}
        >
          {responses.length} submitted
        </span>
        <div style={{ flex: 1 }} />
        {/* Group filter */}
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "#e2e8f0",
            fontSize: 13,
            padding: "6px 10px",
            fontFamily: FONT_SANS,
            cursor: "pointer",
          }}
        >
          <option value="all">All groups</option>
          {[1, 2, 3, 4, 5].map((g) => (
            <option key={g} value={String(g)}>Group {g}</option>
          ))}
        </select>
        <button
          onClick={fetchResponses}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "rgba(148,163,184,0.7)",
            fontSize: 12,
            padding: "6px 12px",
            fontFamily: FONT_SANS,
            cursor: "pointer",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {visibleResponses.length === 0 ? (
        <div
          style={{
            ...CARD_STYLE,
            padding: "40px 20px",
            textAlign: "center",
            color: "rgba(148,163,184,0.45)",
            fontFamily: FONT_SANS,
            fontSize: 14,
          }}
        >
          No responses yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibleResponses.map((r) => (
            <div
              key={r.id}
              style={{
                ...CARD_STYLE,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                borderColor: r.reviewed ? "rgba(52,211,153,0.2)" : undefined,
                background: r.reviewed ? "rgba(52,211,153,0.04)" : undefined,
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: FONT_SANS,
                  flexShrink: 0,
                }}
              >
                {r.profiles?.avatar_initials || "??"}
              </div>

              {/* Name + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "#e2e8f0", fontWeight: 600, fontFamily: FONT_SANS, fontSize: 14 }}>
                  {r.profiles?.full_name || "Unknown student"}
                </div>
                <div style={{ color: "rgba(148,163,184,0.5)", fontSize: 12, fontFamily: FONT_SANS, marginTop: 2 }}>
                  Group {r.profiles?.group_number ?? "—"} ·{" "}
                  {new Date(r.submitted_at).toLocaleString("en-US", { timeZone: "America/Puerto_Rico" })}
                  {r.paste_attempts > 0 && (
                    <span style={{ color: "#f87171", marginLeft: 8 }}>
                      ⚠ {r.paste_attempts} paste attempt{r.paste_attempts !== 1 ? "s" : ""}
                    </span>
                  )}
                  {r.tabaway_count > 0 && (
                    <span style={{ color: "#fbbf24", marginLeft: 8 }}>
                      ↗ {r.tabaway_count} tab-away{r.tabaway_count !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Reviewed toggle */}
              <button
                onClick={() => toggleReviewed(r)}
                disabled={togglingId === r.id}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: r.reviewed
                    ? "1px solid rgba(52,211,153,0.35)"
                    : "1px solid rgba(255,255,255,0.1)",
                  background: r.reviewed ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)",
                  color: r.reviewed ? "#34d399" : "rgba(148,163,184,0.5)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: togglingId === r.id ? "wait" : "pointer",
                  fontFamily: FONT_SANS,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {r.reviewed ? "✓ Reviewed" : "Mark reviewed"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
