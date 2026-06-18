import { useEffect, useState } from "react";
import elevateProjectLogo from "../assets/branding/elevate-proj-logo-full-NB.png";

const TOTAL_DURATION = 2800; // ms before calling onDone
const FADE_OUT_START = 2000; // ms when fade-out begins

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState("in"); // "in" | "hold" | "out"

  useEffect(() => {
    // fade-in → hold → fade-out → done
    const holdTimer   = setTimeout(() => setPhase("hold"), 600);
    const outTimer    = setTimeout(() => setPhase("out"),  FADE_OUT_START);
    const doneTimer   = setTimeout(onDone, TOTAL_DURATION);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(outTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  const opacity =
    phase === "in"   ? 0 :
    phase === "hold" ? 1 :
    0; // "out"

  const transition =
    phase === "in"  ? "opacity 0.6s ease-in" :
    phase === "out" ? "opacity 0.6s ease-out" :
    "none";

  return (
    <div
      style={{
        position:       "fixed",
        inset:          0,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        background:     "linear-gradient(135deg, #060e1f 0%, #0a1628 60%, #0d1f3c 100%)",
        zIndex:         9999,
      }}
    >
      {/* Subtle radial glow behind logo */}
      <div
        style={{
          position:  "absolute",
          width:     480,
          height:    480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          opacity,
          transition,
        }}
      />

      <img
        src={elevateProjectLogo}
        alt="Project ELEVATE"
        style={{
          width:      "min(420px, 72vw)",
          height:     "auto",
          opacity,
          transition,
          position:   "relative",
          filter:     "drop-shadow(0 0 32px rgba(59,130,246,0.35))",
        }}
      />
    </div>
  );
}
