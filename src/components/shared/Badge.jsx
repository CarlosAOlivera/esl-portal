// Shared label chips used across student and teacher views.
//
// Badge — color-coded status pill for flipped items and assignments
//         (published ● / scheduled ◷ / draft ○).
//
// TypeChip — content-format icon + label (Video, Podcast, PDF, Website).
//            Exported as a named export because it co-locates with Badge.

import { FONT_SANS } from "../../styles/tokens";
import { STATUS_CONFIG, CONTENT_TYPES } from "../../data/mockData";

// Default export: status badge
export default function Badge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span
      style={{
        background: config.bg,
        color: config.color,
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 9px",
        borderRadius: 20,
        letterSpacing: "0.07em",
        fontFamily: FONT_SANS,
        whiteSpace: "nowrap",
      }}
    >
      {config.label}
    </span>
  );
}

// Named export: content-type chip
export function TypeChip({ type }) {
  const config = CONTENT_TYPES[type] || CONTENT_TYPES.video;
  return (
    <span
      style={{
        background: `${config.color}15`,
        color: config.color,
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 20,
        fontFamily: FONT_SANS,
      }}
    >
      {config.icon} {config.label}
    </span>
  );
}
