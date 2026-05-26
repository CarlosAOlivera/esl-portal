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

// ── Teacher navigation header ─────────────────────────────────────────────────

function TeacherHeader({ user, currentView, setView, onLogout }) {
  const tabs = [
    { id: "dashboard",   label: "Dashboard",    icon: "📊" },
    { id: "flipped",     label: "Material",     icon: "🎬" },
    { id: "assignments", label: "Asignaciones", icon: "📋" },
    { id: "responses",   label: "Respuestas",   icon: "👁" },
  ];

  return (
    <header
      style={{
        background: "rgba(8,16,30,0.97)",
        borderBottom: "1px solid rgba(99,102,241,0.2)",
        padding: "0 16px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>📚</span>
        <span
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            fontFamily: FONT_SERIF,
          }}
        >
          ESL 12
        </span>
        <span
          style={{
            background: "rgba(99,102,241,0.2)",
            color: "#a78bfa",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 20,
            letterSpacing: "0.08em",
            fontFamily: FONT_SANS,
          }}
        >
          MAESTRO
        </span>
      </div>

      <nav style={{ display: "flex", gap: 2 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "none",
              background:
                currentView === tab.id ? "rgba(99,102,241,0.2)" : "transparent",
              color:
                currentView === tab.id ? "#a78bfa" : "rgba(148,163,184,0.5)",
              fontSize: 12,
              fontWeight: currentView === tab.id ? 600 : 400,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: FONT_SANS,
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={onLogout}
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          border: "none",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: FONT_SANS,
        }}
      >
        {user.avatarInitials}
      </button>
    </header>
  );
}

// ── Dashboard: class analytics and student roster ─────────────────────────────

function Dashboard({ roster, setRoster, flippedItems, assignments }) {
  const submittedCount      = roster.filter((student) => student.submitted).length;
  const reviewedCount       = roster.filter((student) => student.reviewed).length;
  const flaggedCount        = roster.filter((student) => student.pasteAttempts > 2).length;
  const studentsWhoUsedTutor = roster.filter((student) => student.tutorMinutes > 0);
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
    setRoster((currentRoster) =>
      currentRoster.map((student) =>
        student.id === studentId
          ? { ...student, reviewed: !student.reviewed }
          : student
      )
    );

  const columnHeaders = ["Estudiante", "Estado", "Tutor", "Msgs", "Pegar", ""];

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
          {new Date().toLocaleDateString("es-PR", {
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
            ?.title || "Sin asignación activa"}{" "}
          · activa
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
              Próximo material programado
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
        style={{ display: "flex", gap: 11, marginBottom: 22, flexWrap: "wrap" }}
      >
        <Stat
          icon="✅"
          label="Entregaron"
          value={`${submittedCount}/${roster.length}`}
          sub={`${Math.round((submittedCount / roster.length) * 100)}%`}
          color="#34d399"
        />
        <Stat
          icon="👁"
          label="Revisadas"
          value={reviewedCount}
          sub="por ti"
          color="#60a5fa"
        />
        <Stat
          icon="🤖"
          label="Usaron Tutor"
          value={studentsWhoUsedTutor.length}
          sub={`Prom. ${averageTutorMinutes} min`}
          color="#a78bfa"
        />
        <Stat
          icon="⚠️"
          label="Alertas"
          value={flaggedCount}
          sub="pegar >2x"
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
            Progreso del grupo
          </span>
          <span
            style={{
              color: "rgba(148,163,184,0.5)",
              fontSize: 12,
              fontFamily: FONT_SANS,
            }}
          >
            {submittedCount} de {roster.length}
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
              width: `${(submittedCount / roster.length) * 100}%`,
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
            gap: 8,
          }}
        >
          <span
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              fontFamily: FONT_SANS,
            }}
          >
            Resumen por estudiante
          </span>
          <span
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(148,163,184,0.6)",
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 20,
              fontFamily: FONT_SANS,
            }}
          >
            {roster.length}
          </span>
        </div>

        {/* Column headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 70px 60px 75px 115px",
            padding: "9px 19px",
            background: "rgba(0,0,0,0.2)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {columnHeaders.map((header, index) => (
            <div
              key={index}
              style={{
                color: "rgba(148,163,184,0.45)",
                fontSize: 10,
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
        {roster.map((student, index) => (
          <div
            key={student.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 70px 60px 75px 115px",
              padding: "10px 19px",
              borderBottom:
                index < roster.length - 1
                  ? "1px solid rgba(255,255,255,0.04)"
                  : "none",
              alignItems: "center",
              background:
                student.pasteAttempts > 2
                  ? "rgba(239,68,68,0.04)"
                  : "transparent",
            }}
          >
            {/* Name + avatar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: student.submitted
                    ? "linear-gradient(135deg,#3b82f6,#6366f1)"
                    : "linear-gradient(135deg,rgba(100,116,139,0.4),rgba(71,85,105,0.4))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 10,
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
                  fontSize: 13,
                  fontFamily: FONT_SANS,
                  fontWeight: student.pasteAttempts > 2 ? 600 : 400,
                }}
              >
                {student.name}
              </span>
            </div>

            {/* Submission status */}
            <div>
              {student.submitted ? (
                <span
                  style={{
                    background: student.reviewed
                      ? "rgba(52,211,153,0.12)"
                      : "rgba(251,191,36,0.12)",
                    color: student.reviewed ? "#34d399" : "#fbbf24",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 20,
                    fontFamily: FONT_SANS,
                  }}
                >
                  {student.reviewed ? "✓ Revisado" : "Entregado"}
                </span>
              ) : (
                <span
                  style={{
                    background: "rgba(148,163,184,0.08)",
                    color: "rgba(148,163,184,0.5)",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 20,
                    fontFamily: FONT_SANS,
                  }}
                >
                  Pendiente
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
                fontSize: 12,
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
                fontSize: 12,
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
                    fontSize: 12,
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
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 20,
                    fontFamily: FONT_SANS,
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
                    padding: "5px 10px",
                    borderRadius: 8,
                    border: student.reviewed
                      ? "1px solid rgba(52,211,153,0.3)"
                      : "1px solid rgba(255,255,255,0.1)",
                    background: student.reviewed
                      ? "rgba(52,211,153,0.1)"
                      : "transparent",
                    color: student.reviewed
                      ? "#34d399"
                      : "rgba(148,163,184,0.6)",
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: FONT_SANS,
                  }}
                >
                  {student.reviewed ? "✓ Revisado" : "Marcar"}
                </button>
              )}
            </div>
          </div>
        ))}
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
  setFlippedItems,
  assignments,
  setAssignments,
  roster,
  setRoster,
}) {
  const [currentView, setCurrentView] = useState("dashboard");

  return (
    <div style={{ minHeight: "100vh", background: BACKGROUND_GRADIENT, color: "#fff" }}>
      <TeacherHeader
        user={user}
        currentView={currentView}
        setView={setCurrentView}
        onLogout={onLogout}
      />
      <main>
        {currentView === "dashboard" && (
          <Dashboard
            roster={roster}
            setRoster={setRoster}
            flippedItems={flippedItems}
            assignments={assignments}
          />
        )}
        {currentView === "flipped" && (
          <FlippedMgr
            flippedItems={flippedItems}
            setFlippedItems={setFlippedItems}
            assignments={assignments}
          />
        )}
        {currentView === "assignments" && (
          <AssignmentsMgr
            assignments={assignments}
            setAssignments={setAssignments}
            flippedItems={flippedItems}
          />
        )}
        {currentView === "responses" && (
          <Responses roster={roster} setRoster={setRoster} />
        )}
      </main>
    </div>
  );
}
