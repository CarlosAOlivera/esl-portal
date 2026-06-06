// ProfilePanel — slide-in panel from the right showing user profile & stats.
// Appears when the user clicks their avatar initials in the header.
// Fetches live data from Supabase: assignment count, paste strikes, tab-aways.

import { useState, useEffect } from "react";
import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";
import { supabase } from "../../lib/supabaseClient";

// ── XP / Level system ────────────────────────────────────────────────────────
// 100 XP per assignment submitted. Tokens = XP ÷ 10.
const XP_PER_ASSIGNMENT = 100;

const LEVELS = [
  { level: 1, label: "Beginner",     min: 0,    max: 199   },
  { level: 2, label: "Developing",   min: 200,  max: 499   },
  { level: 3, label: "Proficient",   min: 500,  max: 999   },
  { level: 4, label: "Advanced",     min: 1000, max: 1799  },
  { level: 5, label: "Distinguished",min: 1800, max: Infinity },
];

function getLevelInfo(xp) {
  const current = LEVELS.findLast((l) => xp >= l.min) || LEVELS[0];
  const next    = LEVELS[current.level] || null; // null at max level
  const progress = next
    ? ((xp - current.min) / (next.min - current.min)) * 100
    : 100;
  return { current, next, progress: Math.min(progress, 100) };
}

// ── Stat tile ────────────────────────────────────────────────────────────────
function StatTile({ icon, label, value, color = "#60a5fa", sub }) {
  return (
    <div
      style={{
        ...CARD_STYLE,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `${color}18`,
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: "rgba(148,163,184,0.5)",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: FONT_SANS,
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            fontFamily: FONT_SANS,
            lineHeight: 1.2,
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            style={{
              color: "rgba(148,163,184,0.4)",
              fontSize: 10,
              fontFamily: FONT_SANS,
              marginTop: 1,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ProfilePanel ─────────────────────────────────────────────────────────
export default function ProfilePanel({ user, onClose, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Fetch all of the student's responses (or just count + aggregates)
        const { data: responses } = await supabase
          .from("student_responses")
          .select("paste_attempts, tabaway_count, submitted_at")
          .eq("student_id", session.user.id);

        const assignmentsCompleted = responses?.length ?? 0;
        const pasteStrikes = responses?.reduce((sum, r) => sum + (r.paste_attempts ?? 0), 0) ?? 0;
        const tabawayStrikes = responses?.reduce((sum, r) => sum + (r.tabaway_count ?? 0), 0) ?? 0;
        const xp = assignmentsCompleted * XP_PER_ASSIGNMENT;
        const tokens = Math.floor(xp / 10);

        setStats({ assignmentsCompleted, pasteStrikes, tabawayStrikes, xp, tokens });
      } catch (err) {
        console.error("Profile stats error:", err);
        setStats({ assignmentsCompleted: 0, pasteStrikes: 0, tabawayStrikes: 0, xp: 0, tokens: 0 });
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const { current: levelInfo, next: nextLevel, progress } = stats
    ? getLevelInfo(stats.xp)
    : getLevelInfo(0);

  const isTeacher = user.role === "teacher";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 199,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(360px, 100vw)",
          background: "linear-gradient(160deg,#0d1b35 0%,#0a1628 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.09)",
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          animation: "slideInRight 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              color: "rgba(148,163,184,0.5)",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontFamily: FONT_SANS,
            }}
          >
            Profile
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(148,163,184,0.5)",
              fontSize: 18,
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 6,
            }}
          >
            ×
          </button>
        </div>

        {/* Avatar + name */}
        <div style={{ padding: "20px", textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: isTeacher
                ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                : "linear-gradient(135deg,#3b82f6,#6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 24,
              fontWeight: 700,
              margin: "0 auto 12px",
              fontFamily: FONT_SANS,
              boxShadow: "0 8px 24px rgba(59,130,246,0.3)",
            }}
          >
            {user.avatarInitials || user.name?.slice(0, 2).toUpperCase() || "??"}
          </div>
          <div
            style={{
              color: "#fff",
              fontSize: 17,
              fontWeight: 700,
              fontFamily: FONT_SERIF,
              marginBottom: 3,
            }}
          >
            {user.name || user.email}
          </div>
          <div
            style={{
              color: "rgba(148,163,184,0.5)",
              fontSize: 12,
              fontFamily: FONT_SANS,
              marginBottom: 6,
            }}
          >
            {user.email}
          </div>
          <span
            style={{
              background: isTeacher ? "rgba(99,102,241,0.2)" : "rgba(59,130,246,0.15)",
              color: isTeacher ? "#a78bfa" : "#60a5fa",
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              letterSpacing: "0.08em",
              fontFamily: FONT_SANS,
            }}
          >
            {isTeacher ? "TEACHER" : "STUDENT"}
          </span>
        </div>

        {/* For teacher: simple message, no stats */}
        {isTeacher ? (
          <div style={{ padding: "0 20px", flex: 1 }}>
            <div
              style={{
                ...CARD_STYLE,
                padding: "16px 18px",
                textAlign: "center",
                color: "rgba(148,163,184,0.55)",
                fontSize: 13,
                fontFamily: FONT_SANS,
                lineHeight: 1.6,
              }}
            >
              Teacher analytics available in the Dashboard tab.
            </div>
          </div>
        ) : (
          <div style={{ padding: "0 20px", flex: 1 }}>

            {/* XP Level bar */}
            <div
              style={{
                ...CARD_STYLE,
                padding: "14px 16px",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 8,
                }}
              >
                <div>
                  <span
                    style={{
                      color: "#E8A020",
                      fontWeight: 700,
                      fontSize: 15,
                      fontFamily: FONT_SERIF,
                    }}
                  >
                    Level {levelInfo.level}
                  </span>
                  <span
                    style={{
                      color: "rgba(148,163,184,0.5)",
                      fontSize: 11,
                      fontFamily: FONT_SANS,
                      marginLeft: 7,
                    }}
                  >
                    {levelInfo.label}
                  </span>
                </div>
                <span
                  style={{
                    color: "#E8A020",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: FONT_SANS,
                  }}
                >
                  {loading ? "…" : `${stats.xp} XP`}
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: 7,
                  borderRadius: 99,
                  background: "rgba(255,255,255,0.07)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${loading ? 0 : progress}%`,
                    background: "linear-gradient(90deg,#E8A020,#F5C060)",
                    borderRadius: 99,
                    transition: "width 0.8s ease-out",
                  }}
                />
              </div>

              {nextLevel && !loading && (
                <div
                  style={{
                    color: "rgba(148,163,184,0.4)",
                    fontSize: 10,
                    marginTop: 5,
                    textAlign: "right",
                    fontFamily: FONT_SANS,
                  }}
                >
                  {nextLevel.min - stats.xp} XP to Level {nextLevel.level}
                </div>
              )}
            </div>

            {/* Stats grid */}
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  color: "rgba(148,163,184,0.4)",
                  fontSize: 13,
                  fontFamily: FONT_SANS,
                  padding: "20px 0",
                }}
              >
                Loading stats…
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <StatTile
                  icon="✅"
                  label="Assignments Completed"
                  value={stats.assignmentsCompleted}
                  color="#34d399"
                  sub={`${stats.xp} XP earned`}
                />
                <StatTile
                  icon="🪙"
                  label="Tokens"
                  value={stats.tokens}
                  color="#E8A020"
                  sub="Redeemable for quizzes & bonuses"
                />
                <StatTile
                  icon="⚠️"
                  label="Paste Attempts"
                  value={stats.pasteStrikes}
                  color={stats.pasteStrikes > 5 ? "#E84060" : "#fbbf24"}
                  sub={stats.pasteStrikes === 0 ? "Clean record ✓" : "Detected during assignments"}
                />
                <StatTile
                  icon="👁"
                  label="Screen Exits"
                  value={stats.tabawayStrikes}
                  color={stats.tabawayStrikes > 3 ? "#E84060" : "#6080A0"}
                  sub={stats.tabawayStrikes === 0 ? "Great focus ✓" : "Times you left the assignment"}
                />
              </div>
            )}
          </div>
        )}

        {/* Sign out */}
        <div style={{ padding: "20px" }}>
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 10,
              border: "1px solid rgba(239,68,68,0.25)",
              background: "rgba(239,68,68,0.07)",
              color: "#f87171",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT_SANS,
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </>
  );
}
