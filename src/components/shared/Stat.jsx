// Stat — a single metric card used in the teacher Dashboard.
// Displays an emoji icon, a large colored value, a bold label,
// and an optional dimmer sub-label (e.g. percentage or average).

import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";

export default function Stat({ icon, label, value, sub, color }) {
  return (
    <div style={{ ...CARD_STYLE, padding: "18px 20px", flex: 1, minWidth: 110 }}>
      <div style={{ fontSize: 20, marginBottom: 7 }}>{icon}</div>
      <div
        style={{
          color,
          fontSize: 24,
          fontWeight: 700,
          fontFamily: FONT_SERIF,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          margin: "4px 0 2px",
          fontFamily: FONT_SANS,
        }}
      >
        {label}
      </div>
      {sub && (
        <div
          style={{
            color: "rgba(148,163,184,0.5)",
            fontSize: 11,
            fontFamily: FONT_SANS,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
