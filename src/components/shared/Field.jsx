// Field — a labeled form control used in teacher management forms.
// Renders either a single-line <input> or a multi-line <textarea>
// depending on the `type` prop. Keeps form styling consistent across
// FlippedMgr and AssignmentsMgr.

import { FONT_SANS } from "../../styles/tokens";

export default function Field({
  label,
  value,
  onChange,
  type = "text",
  ph = "",
  rows = 3,
}) {
  const baseStyle = {
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
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          color: "rgba(148,163,184,0.6)",
          fontSize: 11,
          marginBottom: 5,
          fontFamily: FONT_SANS,
        }}
      >
        {label}
      </div>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          style={{ ...baseStyle, resize: "none" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={ph}
          style={baseStyle}
        />
      )}
    </div>
  );
}
