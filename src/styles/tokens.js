// Design tokens — global visual constants shared across all components.
// This is the single source of truth for the app's dark-blue color palette,
// glassmorphism card style, and typography stacks.
// Import from here instead of hardcoding values in components.

// Full-viewport dark gradient used as the page background
export const BACKGROUND_GRADIENT =
  "linear-gradient(160deg,#070f1e 0%,#0d1b35 60%,#0a1628 100%)";

// Glassmorphism card surface — spread as { ...CARD_STYLE } on any container
export const CARD_STYLE = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.09)",
  borderRadius: 20,
};

// System sans-serif for UI labels, body text, and buttons
export const FONT_SANS = "system-ui,sans-serif";

// Georgia serif for headings and concept terms
export const FONT_SERIF = "'Georgia',serif";
