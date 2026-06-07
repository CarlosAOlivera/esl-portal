// HomeView — the student's main material tab.
// Shows today's flipped content (videos, podcasts, PDFs, websites) and,
// during school hours, a shortcut card to the active assignment.
//
// This file also contains StudentHeader and StudentPortal because they form
// the student-side navigation shell that wraps HomeView, IntroView, and
// AssignmentView. App.jsx imports StudentPortal as this file's default export.

import { useState } from "react";
import {
  BACKGROUND_GRADIENT,
  CARD_STYLE,
  FONT_SANS,
  FONT_SERIF,
} from "../../styles/tokens";
import { todayStr, getCurrentConcepts } from "../../data/mockData";
import { useSchoolHours } from "../../hooks/useSchoolHours";
import { useIsMobile } from "../../hooks/useIsMobile";
import ContentViewer from "../shared/ContentViewer";
import { TypeChip } from "../shared/Badge";
import IntroView from "./IntroView";
import AssignmentView from "./AssignmentView";
import ProfilePanel from "../shared/ProfilePanel";
import Footer from "../shared/Footer";

// ── Student navigation header ─────────────────────────────────────────────────

function StudentHeader({ user, currentView, setView, onAvatarClick }) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: "intro",      label: "Concepts",   icon: "💡" },
    { id: "home",       label: "Material",   icon: "🏠" },
    { id: "assignment", label: "Assignment", icon: "✏️" },
  ];

  const handleTab = (id) => { setView(id); setMenuOpen(false); };
  const handleProfile = () => { onAvatarClick(); setMenuOpen(false); };

  const HEADER_BG = "rgba(10,22,40,0.97)";

  return (
    <>
      <header
        style={{
          background: HEADER_BG,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
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
        </div>

        {isMobile ? (
          /* ── Portrait: hamburger button ── */
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 22,
              cursor: "pointer",
              padding: "4px 8px",
              lineHeight: 1,
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        ) : (
          /* ── Landscape: inline nav + avatar ── */
          <>
            <nav style={{ display: "flex", gap: 2 }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: currentView === tab.id ? "rgba(59,130,246,0.2)" : "transparent",
                    color: currentView === tab.id ? "#60a5fa" : "rgba(148,163,184,0.55)",
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
              onClick={onAvatarClick}
              title="View profile"
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg,#3b82f6,#6366f1)",
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
              position: "fixed",
              top: 56,
              left: 0,
              right: 0,
              zIndex: 199,
              background: HEADER_BG,
              borderBottom: "1px solid rgba(255,255,255,0.09)",
              backdropFilter: "blur(16px)",
              padding: "8px 0",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTab(tab.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 24px",
                  border: "none",
                  background: currentView === tab.id ? "rgba(59,130,246,0.12)" : "transparent",
                  color: currentView === tab.id ? "#60a5fa" : "rgba(203,213,225,0.8)",
                  fontSize: 15,
                  fontWeight: currentView === tab.id ? 700 : 400,
                  cursor: "pointer",
                  fontFamily: FONT_SANS,
                  textAlign: "left",
                  borderLeft: currentView === tab.id ? "3px solid #3b82f6" : "3px solid transparent",
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
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 24px",
                border: "none",
                background: "transparent",
                color: "rgba(203,213,225,0.8)",
                fontSize: 15,
                cursor: "pointer",
                fontFamily: FONT_SANS,
                textAlign: "left",
                borderLeft: "3px solid transparent",
              }}
            >
              <div
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg,#3b82f6,#6366f1)",
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

// ── HomeView: today's material and assignment shortcut ────────────────────────

function HomeView({ flippedItems, assignment, onGoToAssignment }) {
  const [viewedItems, setViewedItems] = useState({});
  const isSchoolHours = useSchoolHours();
  const today = todayStr();

  const visibleItems = flippedItems
    .filter((item) => item.publishDate <= today)
    .sort((first, second) =>
      second.publishDate.localeCompare(first.publishDate)
    );

  const todayItems = visibleItems.filter((item) => item.publishDate === today);
  const pastItems  = visibleItems.filter((item) => item.publishDate < today);

  // Inner card component — defined here so it can close over `viewedItems`
  function FlippedItemCard({ flippedItem }) {
    return (
      <div style={{ ...CARD_STYLE, overflow: "hidden", marginBottom: 12 }}>
        <div
          style={{
            padding: "13px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <TypeChip type={flippedItem.type} />
          <span
            style={{
              color: "rgba(148,163,184,0.5)",
              fontSize: 11,
              fontFamily: FONT_SANS,
            }}
          >
            {flippedItem.unit}
          </span>
          {viewedItems[flippedItem.id] && (
            <span
              style={{
                color: "#34d399",
                fontSize: 12,
                fontFamily: FONT_SANS,
                marginLeft: "auto",
              }}
            >
              ✓ Seen
            </span>
          )}
        </div>

        <div style={{ padding: "14px 20px" }}>
          <h3
            style={{
              color: "#fff",
              fontSize: 15,
              margin: "0 0 6px",
              fontFamily: FONT_SERIF,
            }}
          >
            {flippedItem.title}
          </h3>
          <p
            style={{
              color: "rgba(148,163,184,0.7)",
              fontSize: 13,
              margin: "0 0 14px",
              lineHeight: 1.6,
              fontFamily: FONT_SANS,
            }}
          >
            {flippedItem.description}
          </p>
          <ContentViewer item={flippedItem} />
          {flippedItem.type !== "website" && (
            <button
              onClick={() =>
                setViewedItems((previous) => ({
                  ...previous,
                  [flippedItem.id]: true,
                }))
              }
              style={{
                width: "100%",
                marginTop: 12,
                padding: "10px",
                borderRadius: 9,
                border: viewedItems[flippedItem.id]
                  ? "1px solid rgba(52,211,153,0.3)"
                  : "none",
                background: viewedItems[flippedItem.id]
                  ? "rgba(52,211,153,0.1)"
                  : "rgba(59,130,246,0.14)",
                color: viewedItems[flippedItem.id] ? "#34d399" : "#60a5fa",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: FONT_SANS,
              }}
            >
              {viewedItems[flippedItem.id]
                ? "✓ Marked as seen"
                : "Mark as seen"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
      {/* Today's material */}
      {todayItems.length > 0 && (
        <>
          <div
            style={{
              color: "rgba(148,163,184,0.5)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 10,
              fontFamily: FONT_SANS,
            }}
          >
            Today's Material
          </div>
          {todayItems.map((item) => (
            <FlippedItemCard key={item.id} flippedItem={item} />
          ))}
        </>
      )}

      {/* Assignment shortcut — only shown during school hours */}
      {assignment && isSchoolHours && (
        <div
          onClick={onGoToAssignment}
          style={{
            ...CARD_STYLE,
            padding: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 14,
            background:
              "linear-gradient(135deg,rgba(59,130,246,0.1),rgba(99,102,241,0.07))",
            borderColor: "rgba(59,130,246,0.22)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
            }}
          >
            ✏️
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                color: "rgba(148,163,184,0.5)",
                fontSize: 11,
                marginBottom: 2,
                fontFamily: FONT_SANS,
              }}
            >
              TODAY'S ASSIGNMENT
            </div>
            <div
              style={{
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                fontFamily: FONT_SERIF,
              }}
            >
              {assignment.title}
            </div>
            <div
              style={{
                color: "rgba(148,163,184,0.5)",
                fontSize: 12,
                fontFamily: FONT_SANS,
              }}
            >
              {assignment.unit} · {assignment.questions.length} questions
            </div>
          </div>
          <span style={{ color: "rgba(148,163,184,0.35)", fontSize: 18 }}>→</span>
        </div>
      )}

      {/* Assignment locked notice — shown outside school hours */}
      {assignment && !isSchoolHours && (
        <div
          style={{
            ...CARD_STYLE,
            padding: 20,
            borderColor: "rgba(239,68,68,0.2)",
            background: "rgba(239,68,68,0.06)",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 26, marginBottom: 6 }}>🔒</div>
          <div
            style={{
              color: "#fca5a5",
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 3,
              fontFamily: FONT_SANS,
            }}
          >
            Assignment Unavailable
          </div>
          <div
            style={{
              color: "rgba(148,163,184,0.55)",
              fontSize: 13,
              fontFamily: FONT_SANS,
            }}
          >
            Only accessible from{" "}
            <strong style={{ color: "#60a5fa" }}>7:30am – 2:30pm</strong>
          </div>
        </div>
      )}

      {/* Past material — available for study */}
      {pastItems.length > 0 && (
        <>
          <div
            style={{
              color: "rgba(148,163,184,0.45)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 10,
              fontFamily: FONT_SANS,
            }}
          >
            Previous Material — for review
          </div>
          {pastItems.map((item) => (
            <FlippedItemCard key={item.id} flippedItem={item} />
          ))}
        </>
      )}
    </div>
  );
}

// ── StudentPortal: top-level shell that owns student tab routing ──────────────
// Default export — imported by App.jsx to render the full student experience.

export default function StudentPortal({ user, onLogout, flippedItems, assignments, dataLoading }) {
  const [currentView, setCurrentView]     = useState("intro");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const activeAssignment =
    assignments.find((assignment) => assignment.status === "published") || null;

  return (
    <div style={{ minHeight: "100vh", background: BACKGROUND_GRADIENT, color: "#fff", display: "flex", flexDirection: "column" }}>
      <StudentHeader
        user={user}
        currentView={currentView}
        setView={setCurrentView}
        onAvatarClick={() => setIsProfileOpen(true)}
      />
      <main style={{ flex: 1 }}>
        {currentView === "intro" && (
          <IntroView
            onContinue={() => setCurrentView("home")}
            concepts={getCurrentConcepts()}
          />
        )}
        {currentView === "home" && (
          <HomeView
            flippedItems={flippedItems}
            assignment={activeAssignment}
            onGoToAssignment={() => setCurrentView("assignment")}
          />
        )}
        {currentView === "assignment" && activeAssignment && (
          <AssignmentView assignment={activeAssignment} />
        )}
        {currentView === "assignment" && !activeAssignment && (
          <div
            style={{
              maxWidth: 500,
              margin: "80px auto",
              textAlign: "center",
              padding: "0 20px",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>📭</div>
            <h2 style={{ color: "#fff", fontFamily: FONT_SERIF, marginBottom: 8 }}>
              No active assignment
            </h2>
            <p style={{ color: "rgba(148,163,184,0.6)", fontFamily: FONT_SANS }}>
              The teacher hasn't published an assignment yet.
            </p>
          </div>
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
