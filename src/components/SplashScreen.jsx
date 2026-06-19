import { useEffect, useState, useRef } from "react";
import elevateProjectLogo from "../assets/branding/elevate-proj-logo-full-NB.png";

const TOTAL_DURATION  = 6000; // ms before calling onDone
const FADE_OUT_START  = 5000; // ms when fade-out begins
const PARTICLES       = 28;   // number of light particles

// Deterministic particle config (avoids re-randomizing on re-render)
const PARTICLE_CONFIG = Array.from({ length: PARTICLES }, (_, i) => {
  const angle    = (i / PARTICLES) * 360 + (i % 3) * 7;
  const distance = 120 + (i % 5) * 38;
  const size     = 2 + (i % 4);
  const delay    = (i % 7) * 80;
  const duration = 900 + (i % 5) * 160;
  const color    = i % 4 === 0 ? "#f5c060" : i % 4 === 1 ? "#60a5fa" : i % 4 === 2 ? "#00d4bc" : "#c4b5fd";
  return { angle, distance, size, delay, duration, color };
});

export default function SplashScreen({ onDone }) {
  const [phase,        setPhase]        = useState("in");     // "in" | "hold" | "burst" | "settle" | "out"
  const [particles,    setParticles]    = useState(false);
  const [logoScale,    setLogoScale]    = useState(0.72);
  const [glowSize,     setGlowSize]     = useState(320);
  const [rayOpacity,   setRayOpacity]   = useState(0);
  const [taglinePhase, setTaglinePhase] = useState("hidden"); // "hidden" | "in" | "visible" | "out"

  useEffect(() => {
    // t=0      → logo fades+scales in
    // t=600    → hold phase begins
    // t=900    → particle burst + glow expands
    // t=1100   → rays flash
    // t=1500   → particles settle, rays fade
    // t=3400   → fade out starts
    // t=4200   → done

    const t = (ms, fn) => setTimeout(fn, ms);

    const timers = [
      t(0,    () => { setPhase("in"); }),
      t(600,  () => { setPhase("hold"); setLogoScale(1); }),
      t(900,  () => { setParticles(true); setGlowSize(560); setPhase("burst"); }),
      t(1100, () => { setRayOpacity(1); }),
      t(1600, () => { setRayOpacity(0); }),
      t(2000, () => { setGlowSize(400); setPhase("settle"); }),
      t(2200, () => { setTaglinePhase("in"); }),
      t(2900, () => { setTaglinePhase("visible"); }),
      t(5000, () => { setPhase("out"); setTaglinePhase("out"); }),
      t(6000, () => { onDone(); }),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const logoOpacity =
    phase === "in"     ? 0 :
    phase === "out"    ? 0 : 1;

  const logoTransition =
    phase === "in"     ? "opacity 0.55s ease-out, transform 0.55s cubic-bezier(0.34,1.56,0.64,1)" :
    phase === "out"    ? "opacity 0.7s ease-in, transform 0.7s ease-in" :
    phase === "burst"  ? "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)" :
    "transform 0.5s ease-out";

  const logoTransform =
    phase === "out"    ? "scale(0.88)" :
    `scale(${logoScale})`;

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
        overflow:       "hidden",
      }}
    >
      {/* CSS keyframes */}
      <style>{`
        @keyframes particleFly {
          0%   { transform: translate(0,0) scale(1); opacity: 1; }
          60%  { opacity: 0.8; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.18; }
          50%      { opacity: 0.32; }
        }
        @keyframes rayFlash {
          0%   { opacity: 0; transform: scaleY(0.2); }
          30%  { opacity: 1; transform: scaleY(1); }
          100% { opacity: 0; transform: scaleY(1.4); }
        }
        @keyframes ringExpand {
          0%   { transform: scale(0.4); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* Ambient glow */}
      <div
        style={{
          position:     "absolute",
          width:        glowSize,
          height:       glowSize,
          borderRadius: "50%",
          background:   "radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)",
          transition:   "width 0.6s ease-out, height 0.6s ease-out",
          animation:    phase === "settle" ? "glowPulse 2s ease-in-out infinite" : "none",
          pointerEvents: "none",
        }}
      />

      {/* Expanding ring on burst */}
      {phase === "burst" && (
        <div
          style={{
            position:     "absolute",
            width:        280,
            height:       280,
            borderRadius: "50%",
            border:       "2px solid rgba(96,165,250,0.6)",
            animation:    "ringExpand 0.9s ease-out forwards",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Light rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <div
          key={i}
          style={{
            position:      "absolute",
            width:         2,
            height:        180,
            background:    `linear-gradient(to top, transparent, ${i % 2 === 0 ? "rgba(96,165,250,0.7)" : "rgba(245,192,96,0.5)"}, transparent)`,
            transformOrigin: "center bottom",
            transform:     `rotate(${angle}deg) translateY(-90px)`,
            opacity:       rayOpacity,
            transition:    rayOpacity === 1
              ? `opacity 0.18s ease-out ${i * 15}ms`
              : `opacity 0.5s ease-in ${i * 10}ms`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Particles */}
      {particles && PARTICLE_CONFIG.map((p, i) => {
        const rad  = (p.angle * Math.PI) / 180;
        const tx   = Math.cos(rad) * p.distance;
        const ty   = Math.sin(rad) * p.distance;
        return (
          <div
            key={i}
            style={{
              position:     "absolute",
              width:        p.size,
              height:       p.size,
              borderRadius: "50%",
              background:   p.color,
              boxShadow:    `0 0 ${p.size * 2}px ${p.color}`,
              "--tx":       `${tx}px`,
              "--ty":       `${ty}px`,
              animation:    `particleFly ${p.duration}ms ease-out ${p.delay}ms forwards`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Tagline */}
      <div
        style={{
          position:      "absolute",
          top:           "calc(50% + 110px)",
          left:          0,
          right:         0,
          textAlign:     "center",
          fontFamily:    "'Inter', 'SF Pro Display', system-ui, sans-serif",
          fontSize:      "clamp(11px, 1.5vw, 14px)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color:         "rgba(148,184,255,0.82)",
          opacity:       taglinePhase === "hidden" || taglinePhase === "out" ? 0 : 1,
          transform:     taglinePhase === "hidden" ? "translateY(10px)" : "translateY(0)",
          transition:    taglinePhase === "in"
            ? "opacity 0.7s ease-out, transform 0.7s ease-out"
            : taglinePhase === "out"
            ? "opacity 0.5s ease-in"
            : "none",
          pointerEvents: "none",
          zIndex:        1,
          padding:       "0 20px",
        }}
      >
        English Learning Enhanced Via AI, Technology &amp; Experience
      </div>

      {/* Logo */}
      <img
        src={elevateProjectLogo}
        alt="Project ELEVATE"
        style={{
          width:      "min(420px, 72vw)",
          height:     "auto",
          opacity:    logoOpacity,
          transition: logoTransition,
          transform:  logoTransform,
          position:   "relative",
          filter:     phase === "burst"
            ? "drop-shadow(0 0 48px rgba(59,130,246,0.7)) drop-shadow(0 0 24px rgba(245,192,96,0.4))"
            : "drop-shadow(0 0 28px rgba(59,130,246,0.4))",
          zIndex: 1,
        }}
      />
    </div>
  );
}
