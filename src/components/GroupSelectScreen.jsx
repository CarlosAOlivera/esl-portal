// GroupSelectScreen — shown to students on first login when group_number is null.
// Updates the profile directly via Supabase (we have a session at this point).

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { BACKGROUND_GRADIENT, CARD_STYLE, FONT_SANS, FONT_SERIF } from "../styles/tokens";

export default function GroupSelectScreen({ user, onGroupSelected }) {
  const [selected, setSelected] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error: err } = await supabase
        .from("profiles")
        .update({ group_number: selected })
        .eq("id", session.user.id);
      if (err) throw err;
      onGroupSelected(selected);
    } catch (err) {
      console.error("GroupSelect error:", err);
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BACKGROUND_GRADIENT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          ...CARD_STYLE,
          padding: "40px 36px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 16 }}>👋</div>

        <h1
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: 700,
            margin: "0 0 8px",
            fontFamily: FONT_SERIF,
          }}
        >
          Welcome, {user.name.split(" ")[0]}!
        </h1>

        <p
          style={{
            color: "rgba(148,163,184,0.65)",
            fontSize: 13,
            margin: "0 0 28px",
            fontFamily: FONT_SANS,
            lineHeight: 1.6,
          }}
        >
          One last step — select your class group so Prof. Olivera can see your work correctly.
        </p>

        {/* Group buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setSelected(n)}
              style={{
                padding: "14px 20px",
                borderRadius: 12,
                border: selected === n
                  ? "1px solid rgba(59,130,246,0.55)"
                  : "1px solid rgba(255,255,255,0.09)",
                background: selected === n
                  ? "rgba(59,130,246,0.18)"
                  : "rgba(255,255,255,0.03)",
                color: selected === n ? "#60a5fa" : "rgba(203,213,225,0.75)",
                fontSize: 15,
                fontWeight: selected === n ? 700 : 400,
                cursor: "pointer",
                fontFamily: FONT_SANS,
                display: "flex",
                alignItems: "center",
                gap: 12,
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: selected === n
                    ? "linear-gradient(135deg,#3b82f6,#6366f1)"
                    : "rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: selected === n ? "#fff" : "rgba(148,163,184,0.5)",
                  flexShrink: 0,
                }}
              >
                {selected === n ? "✓" : n}
              </span>
              Group {n}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ color: "#f87171", fontSize: 12, margin: "0 0 12px", fontFamily: FONT_SANS }}>
            ⚠️ {error}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={!selected || saving}
          style={{
            width: "100%",
            padding: "13px 24px",
            borderRadius: 12,
            border: "none",
            background: selected && !saving
              ? "linear-gradient(135deg,#3b82f6,#6366f1)"
              : "rgba(255,255,255,0.07)",
            color: selected && !saving ? "#fff" : "rgba(148,163,184,0.35)",
            fontSize: 15,
            fontWeight: 700,
            cursor: selected && !saving ? "pointer" : "not-allowed",
            fontFamily: FONT_SANS,
            boxShadow: selected && !saving ? "0 4px 20px rgba(59,130,246,0.4)" : "none",
          }}
        >
          {saving ? "Saving…" : "Continue to Portal →"}
        </button>
      </div>
    </div>
  );
}
