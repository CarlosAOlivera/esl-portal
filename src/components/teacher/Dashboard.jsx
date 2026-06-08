// Dashboard — the teacher's analytics overview.
// Shows class submission rate, review status, tutor usage, and paste alerts.
// Lists all students in a sortable roster with per-student metrics.
//
// This file also contains TeacherHeader and TeacherPortal, the navigation
// shell for the teacher portal. App.jsx imports TeacherPortal as the default export.

import { useState } from "react";
import {
  BACKGROUND_GRADIENT,
  CARD_STYLE,
  FONT_SANS,
  FONT_SERIF,
} from "../../styles/tokens";
import { fmtDate, daysUntil, flippedStat } from "../../data/mockData";
import Stat from "../shared/Stat";
import FlippedMgr from "./FlippedMgr";
import AssignmentsMgr from "./AssignmentsMgr";
import Responses from "./Responses";
import PlanningStudio from "../PlanningStudio/PlanningStudio";
import { useIsMobile } from "../../hooks/useIsMobile";
import ProfilePanel from "../shared/ProfilePanel";
import Footer from "../shared/Footer";

// ── Teacher navigation header ─────────────────────────────────────────────────

const NAV_TABS = [
  { id: "dashboard",   label: "Dashboard",   icon: "📊" },
  { id: "flipped",     label: "Material",    icon: "🎬" },
  { id: "assignments", label: "Assignments", icon: "📋" },
  { id: "responses",   label: "Responses",   icon: "👁" },
  { id: "planning",    label: "Planning",    icon: "📝" },
];

function TeacherHeader({ user, currentView, setView, onAvatarClick, isMobile }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTab = (id) => { setView(id); setMenuOpen(false); };
  const handleProfile = () => { onAvatarClick(); setMenuOpen(false); };

  const HEADER_BG = "rgba(8,16,30,0.97)";

  return (
    <>
      <header
        style={{
          background: HEADER_BG,
          borderBottom: "1px solid rgba(99,102,241,0.2)",
          padding: "0 16px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 200,
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📚</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: FONT_SERIF }}>
            ESL 12
          </span>
          <span
            style={{
              background: "rgba(99,102,241,0.2)", color: "#a78bfa",
              fontSize: 10, fontWeight: 700, padding: "2px 8px",
              borderRadius: 20, letterSpacing: "0.08em", fontFamily: FONT_SANS,
            }}
          >
            TEACHER
          </span>
        </div>

        {isMobile ? (
          /* ── Portrait: hamburger button ── */
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{
              background: "none", border: "none", color: "#fff",
              fontSize: 22, cursor: "pointer", padding: "4px 8px", lineHeight: 1,
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        ) : (
          /* ── Landscape: inline nav + avatar ── */
          <>
            <nav style={{ display: "flex", gap: 2 }}>
              {NAV_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  style={{
                    padding: "6px 10px", borderRadius: 8, border: "none",
                    background: currentView === tab.id ? "rgba(99,102,241,0.2)" : "transparent",
                    color: currentView === tab.id ? "#a78bfa" : "rgba(148,163,184,0.5)",
                    fontSize: 12, fontWeight: currentView === tab.id ? 600 : 400,
                    cursor: "pointer", display: "flex", alignItems: "center",
                    gap: 4, fontFamily: FONT_SANS,
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
            <button
              onClick={onAvatarClick}
              title="View profile"
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                border: "none", color: "#fff", fontSize: 12,
                fontWeight: 700, cursor: "pointer", fontFamily: FONT_SANS,
              }}
            >
              {user.avatarInitials}
            </button>
          </>
        )}
      </header>

      {/* ── Mobile dropdown menu ── */}
      {isMobile && menuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 198, background: "rgba(0,0,0,0.4)" }}
          />
          {/* Menu panel */}
          <div
            style={{
              position: "fixed", top: 56, left: 0, right: 0, zIndex: 199,
              background: HEADER_BG, borderBottom: "1px solid rgba(99,102,241,0.15)",
              backdropFilter: "blur(16px)", padding: "8px 0",
            }}
          >
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTab(tab.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: 14, padding: "14px 24px", border: "none",
                  background: currentView === tab.id ? "rgba(99,102,241,0.12)" : "transparent",
                  color: currentView === tab.id ? "#a78bfa" : "rgba(203,213,225,0.8)",
                  fontSize: 15, fontWeight: currentView === tab.id ? 700 : 400,
                  cursor: "pointer", fontFamily: FONT_SANS, textAlign: "left",
                  borderLeft: currentView === tab.id ? "3px solid #6366f1" : "3px solid transparent",
                }}
              >
                <span style={{ fontSize: 20 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "8px 0" }} />

            {/* Profile */}
            <button
              onClick={handleProfile}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: 14, padding: "14px 24px", border: "none",
                background: "transparent", color: "rgba(203,213,225,0.8)",
                fontSize: 15, cursor: "pointer", fontFamily: FONT_SANS,
                textAlign: "left", borderLeft: "3px solid transparent",
              }}
            >
              <div
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}
              >
                {user.avatarInitials}
              </div>
              My Profile &amp; Sign Out
            </button>
          </div>
        </>
      )}
    </>
  );
}

// ── Dashboard: class analytics and student roster ─────────────────────────────

function Dashboard({ roster, flippedItems, assignments, isMobile }) {
  const [groupFilter, setGroupFilter] = useState("all");
  const [reviewed,    setReviewed]    = useState({}); // local state keyed by student id

  const filteredRoster = groupFilter === "all"
    ? roster
    : roster.filter((s) => String(s.group) === groupFilter);

  const submittedCount      = filteredRoster.filter((student) => student.submitted).length;
  const reviewedCount       = Object.values(reviewed).filter(Boolean).length;
  const flaggedCount        = filteredRoster.filter((student) => student.pasteAttempts > 2).length;
  const studentsWhoUsedTutor = filteredRoster.filter((student) => student.tutorMinutes > 0);
  const averageTutorMinutes  = studentsWhoUsedTutor.length
    ? Math.round(
        studentsWhoUsedTutor.reduce((total, student) => total + student.tutorMinutes, 0) /
          studentsWhoUsedTutor.length
      )
    : 0;

  const nextScheduledItem = [...flippedItems]
    .filter((item) => flippedStat(item.publishDate) === "scheduled")
    .sort((first, second) => first.publishDate.localeCompare(second.publishDate))[0];

  const toggleReviewed = (studentId) =>
    setReviewed((prev) => ({ ...prev, [studentId]: !prev[studentId] }));

  const columnHeaders = ["Student", "Status", "Tutor", "Msgs", "Paste", ""];

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 20px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            color: "rgba(148,163,184,0.5)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 3,
            fontFamily: FONT_SANS,
          }}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
        <h2
          style={{ color: "#fff", fontSize: 21, margin: "0 0 3px", fontFamily: FONT_SERIF }}
        >
          Dashboard
        </h2>
        <p
          style={{
            color: "rgba(148,163,184,0.5)",
            fontSize: 13,
            margin: 0,
            fontFamily: FONT_SANS,
          }}
        >
          {assignments.find((assignment) => assignment.status === "published")
            ?.title || "No active assignment"}{" "}
          · active
        </p>
      </div>

      {/* Upcoming scheduled material banner */}
      {nextScheduledItem && (
        <div
          style={{
            ...CARD_STYLE,
            padding: "13px 19px",
            marginBottom: 18,
            borderColor: "rgba(99,102,241,0.3)",
            background: "rgba(99,102,241,0.07)",
            display: "flex",
            alignItems: "center",
            gap: 11,
          }}
        >
          <span style={{ fontSize: 18 }}>📅</span>
          <div>
            <div
              style={{
                color: "#a78bfa",
                fontWeight: 600,
                fontSize: 13,
                fontFamily: FONT_SANS,
              }}
            >
              Next scheduled material
            </div>
            <div
              style={{
                color: "rgba(148,163,184,0.7)",
                fontSize: 12,
                fontFamily: FONT_SANS,
              }}
            >
              {nextScheduledItem.title} · {daysUntil(nextScheduledItem.publishDate)} (
              {fmtDate(nextScheduledItem.publishDate)})
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: 11,
          marginBottom: 22,
        }}
      >
        <Stat
          icon="✅"
          label="Submitted"
          value={`${submittedCount}/${filteredRoster.length}`}
          sub={`${Math.round((submittedCount / (filteredRoster.length || 1)) * 100)}%`}
          color="#34d399"
        />
        <Stat
          icon="👁"
          label="Reviewed"
          value={reviewedCount}
          sub="by you"
          color="#60a5fa"
        />
        <Stat
          icon="🤖"
          label="Used Tutor"
          value={studentsWhoUsedTutor.length}
          sub={`Avg. ${averageTutorMinutes} min`}
          color="#a78bfa"
        />
        <Stat
          icon="⚠️"
          label="Alerts"
          value={flaggedCount}
          sub="paste >2x"
          color={flaggedCount > 0 ? "#f87171" : "rgba(148,163,184,0.4)"}
        />
      </div>

      {/* Submission progress bar */}
      <div style={{ ...CARD_STYLE, padding: "15px 19px", marginBottom: 22 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 9,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: FONT_SANS,
            }}
          >
            Class Progress
          </span>
          <span
            style={{
              color: "rgba(148,163,184,0.5)",
              fontSize: 12,
              fontFamily: FONT_SANS,
            }}
          >
            {submittedCount} of {filteredRoster.length}
          </span>
        </div>
        <div
          style={{
            height: 7,
            background: "rgba(255,255,255,0.07)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(submittedCount / (filteredRoster.length || 1)) * 100}%`,
              background: "linear-gradient(90deg,#3b82f6,#6366f1)",
              borderRadius: 4,
            }}
          />
        </div>
      </div>

      {/* Student roster table */}
      <div style={{ ...CARD_STYLE, overflow: "hidden" }}>
        <div
          style={{
            padding: "12px 19px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, fontFamily: FONT_SANS }}>
            Student Summary
          </span>
          <span style={{ background: "rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.6)", fontSize: 11, padding: "2px 8px", borderRadius: 20, fontFamily: FONT_SANS }}>
            {filteredRoster.length}
          </span>
          <div style={{ flex: 1 }} />
          {/* Group filter */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["all", "1", "2", "3", "4", "5"].map((g) => (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: groupFilter === g ? 700 : 400,
                  border: groupFilter === g ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  background: groupFilter === g ? "rgba(99,102,241,0.2)" : "transparent",
                  color: groupFilter === g ? "#a78bfa" : "rgba(148,163,184,0.5)",
                  cursor: "pointer", fontFamily: FONT_SANS,
                }}
              >
                {g === "all" ? "All" : `G${g}`}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable table wrapper — enables horizontal scroll on mobile */}
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {/* Column headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "140px 90px 55px 50px 65px 100px"
                : "1fr 100px 70px 60px 75px 115px",
              padding: "9px 19px",
              background: "rgba(0,0,0,0.2)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              minWidth: isMobile ? 500 : "auto",
            }}
          >
            {columnHeaders.map((header, index) => (
              <div
                key={index}
                style={{
                  color: "rgba(148,163,184,0.45)",
                  fontSize: isMobile ? 9 : 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: FONT_SANS,
                }}
              >
                {header}
              </div>
            ))}
          </div>

          {/* Student rows */}
          {filteredRoster.map((student, index) => (
            <div
              key={student.id}
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "140px 90px 55px 50px 65px 100px"
                  : "1fr 100px 70px 60px 75px 115px",
                padding: isMobile ? "8px 19px" : "10px 19px",
                borderBottom:
                  index < filteredRoster.length - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "none",
                alignItems: "center",
                minWidth: isMobile ? 500 : "auto",
                background:
                  student.pasteAttempts > 2
                    ? "rgba(239,68,68,0.04)"
                    : "transparent",
              }}
            >
              {/* Name + avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: isMobile ? 22 : 26,
                    height: isMobile ? 22 : 26,
                    borderRadius: "50%",
                    background: student.submitted
                      ? "linear-gradient(135deg,#3b82f6,#6366f1)"
                      : "linear-gradient(135deg,rgba(100,116,139,0.4),rgba(71,85,105,0.4))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: isMobile ? 8 : 10,
                    fontWeight: 700,
                    flexShrink: 0,
                    fontFamily: FONT_SANS,
                  }}
                >
                  {student.avatarInitials}
                </div>
                <span
                  style={{
                    color: student.pasteAttempts > 2 ? "#fca5a5" : "#e2e8f0",
                    fontSize: isMobile ? 11 : 13,
                    fontFamily: FONT_SANS,
                    fontWeight: student.pasteAttempts > 2 ? 600 : 400,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {student.name}
                </span>
                {student.group && (
                  <span style={{ background: "rgba(99,102,241,0.15)", color: "#a78bfa", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 20, fontFamily: FONT_SANS, marginLeft: 5 }}>
                    G{student.group}
                  </span>
                )}
              </div>

              {/* Submission status */}
              <div>
                {student.submitted ? (
                  <span
                    style={{
                      background: reviewed[student.id]
                        ? "rgba(52,211,153,0.12)"
                        : "rgba(251,191,36,0.12)",
                      color: reviewed[student.id] ? "#34d399" : "#fbbf24",
                      fontSize: isMobile ? 9 : 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 20,
                      fontFamily: FONT_SANS,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {reviewed[student.id] ? "✓ Reviewed" : "Submitted"}
                  </span>
                ) : (
                  <span
                    style={{
                      background: "rgba(148,163,184,0.08)",
                      color: "rgba(148,163,184,0.5)",
                      fontSize: isMobile ? 9 : 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 20,
                      fontFamily: FONT_SANS,
                    }}
                  >
                    Pending
                  </span>
                )}
              </div>

              {/* Tutor minutes */}
              <div
                style={{
                  color:
                    student.tutorMinutes > 0
                      ? "#a78bfa"
                      : "rgba(148,163,184,0.3)",
                  fontSize: isMobile ? 11 : 12,
                  fontFamily: FONT_SANS,
                }}
              >
                {student.tutorMinutes > 0 ? `${student.tutorMinutes}m` : "—"}
              </div>

              {/* Tutor messages */}
              <div
                style={{
                  color:
                    student.tutorMessages > 0
                      ? "rgba(167,139,250,0.7)"
                      : "rgba(148,163,184,0.3)",
                  fontSize: isMobile ? 11 : 12,
                  fontFamily: FONT_SANS,
                }}
              >
                {student.tutorMessages > 0 ? student.tutorMessages : "—"}
              </div>

              {/* Paste attempts */}
              <div>
                {student.pasteAttempts === 0 ? (
                  <span
                    style={{
                      color: "rgba(148,163,184,0.3)",
                      fontSize: isMobile ? 11 : 12,
                      fontFamily: FONT_SANS,
                    }}
                  >
                    —
                  </span>
                ) : (
                  <span
                    style={{
                      background:
                        student.pasteAttempts > 2
                          ? "rgba(239,68,68,0.15)"
                          : "rgba(251,191,36,0.12)",
                      color:
                        student.pasteAttempts > 2 ? "#f87171" : "#fbbf24",
                      fontSize: isMobile ? 10 : 11,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 20,
                      fontFamily: FONT_SANS,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {student.pasteAttempts > 2 ? "⚠️ " : ""}
                    {student.pasteAttempts}x
                  </span>
                )}
              </div>

              {/* Review toggle */}
              <div>
                {student.submitted && (
                  <button
                    onClick={() => toggleReviewed(student.id)}
                    style={{
                      padding: isMobile ? "4px 8px" : "5px 10px",
                      borderRadius: 8,
                      border: reviewed[student.id]
                        ? "1px solid rgba(52,211,153,0.3)"
                        : "1px solid rgba(255,255,255,0.1)",
                      background: reviewed[student.id]
                        ? "rgba(52,211,153,0.1)"
                        : "transparent",
                      color: reviewed[student.id]
                        ? "#34d399"
                        : "rgba(148,163,184,0.6)",
                      fontSize: isMobile ? 9 : 10,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: FONT_SANS,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {reviewed[student.id] ? "✓ Reviewed" : "Mark reviewed"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── TeacherPortal: top-level shell that owns teacher tab routing ──────────────
// Default export — imported by App.jsx to render the full teacher experience.

export default function TeacherPortal({
  user,
  onLogout,
  flippedItems,
  assignments,
  roster,
  onRefresh,
  dataLoading,
}) {
  const [currentView, setCurrentView]     = useState("dashboard");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div style={{ minHeight: "100vh", background: BACKGROUND_GRADIENT, color: "#fff", display: "flex", flexDirection: "column" }}>
      <TeacherHeader
        user={user}
        currentView={currentView}
        setView={setCurrentView}
        onAvatarClick={() => setIsProfileOpen(true)}
        isMobile={isMobile}
      />
      <main style={{ flex: 1 }}>
        {currentView === "dashboard" && (
          <Dashboard
            roster={roster}
            flippedItems={flippedItems}
            assignments={assignments}
            isMobile={isMobile}
          />
        )}
        {currentView === "flipped" && (
          <FlippedMgr
            flippedItems={flippedItems}
            assignments={assignments}
            onRefresh={onRefresh}
          />
        )}
        {currentView === "assignments" && (
          <AssignmentsMgr
            assignments={assignments}
            flippedItems={flippedItems}
            onRefresh={onRefresh}
          />
        )}
        {currentView === "responses" && (
          <Responses assignments={assignments} />
        )}
        {currentView === "planning" && (
          <PlanningStudio user={user} flippedItems={flippedItems} assignments={assignments} />
        )}
      </main>

      <Footer />

      {isProfileOpen && (
        <ProfilePanel
          user={user}
          onClose={() => setIsProfileOpen(false)}
          onLogout={onLogout}
        />
      )}
    </div>
  );
}
