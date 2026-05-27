// App — root component of the ESL portal.
// Owns all shared state (flipped items, assignments, roster) and routes
// between the login screen and the two role-based portals (student / teacher).
// No UI logic lives here — rendering is fully delegated to portal components.

import { useState } from "react";
import {
  BACKGROUND_GRADIENT,
  CARD_STYLE,
  FONT_SANS,
  FONT_SERIF,
} from "./styles/tokens";
import {
  MOCK_USERS,
  INITIAL_FLIPPED,
  INITIAL_ASSIGNMENTS,
  INITIAL_ROSTER,
} from "./data/mockData";
import StudentPortal from "./components/student/HomeView";
import TeacherPortal from "./components/teacher/Dashboard";

// ── LoginScreen ───────────────────────────────────────────────────────────────
// Shown when no user is authenticated. In demo mode the role selector is visible
// so developers can switch between student and teacher views without real auth.

function LoginScreen({ onLogin }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student");

  const handleLogin = () => {
    setIsLoading(true);
    // Simulates a 1.5-second Microsoft auth redirect
    setTimeout(() => onLogin({ ...MOCK_USERS[selectedRole] }), 1500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BACKGROUND_GRADIENT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.05) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "12%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)",
        }}
      />

      {/* Login card */}
      <div
        style={{
          position: "relative",
          ...CARD_STYLE,
          padding: "48px 44px",
          maxWidth: 420,
          width: "90%",
          textAlign: "center",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* App icon */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 14,
            background: "linear-gradient(135deg,#3b82f6,#6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 26,
            boxShadow: "0 8px 28px rgba(59,130,246,0.4)",
          }}
        >
          📚
        </div>

        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "rgba(148,163,184,0.7)",
            textTransform: "uppercase",
            marginBottom: 6,
            fontFamily: FONT_SANS,
          }}
        >
          Escuela Superior Fernando Suria Chaves
        </div>
        <h1
          style={{
            color: "#fff",
            fontSize: 24,
            fontWeight: 700,
            margin: "0 0 4px",
            fontFamily: FONT_SERIF,
          }}
        >
          ESL Grade 12
        </h1>
        <p
          style={{
            color: "rgba(148,163,184,0.55)",
            fontSize: 13,
            margin: "0 0 28px",
            fontFamily: FONT_SANS,
          }}
        >
          Portal · 2026–2027
        </p>

        {/* Demo role selector */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 6,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 12,
            padding: 4,
          }}
        >
          {["student", "teacher"].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: 9,
                border: "none",
                background:
                  selectedRole === role
                    ? "rgba(59,130,246,0.25)"
                    : "transparent",
                color:
                  selectedRole === role
                    ? "#60a5fa"
                    : "rgba(148,163,184,0.5)",
                fontSize: 13,
                fontWeight: selectedRole === role ? 600 : 400,
                cursor: "pointer",
                fontFamily: FONT_SANS,
                transition: "all 0.15s",
              }}
            >
              {role === "student" ? "👨‍🎓 Student" : "👨‍🏫 Teacher"}
            </button>
          ))}
        </div>
        <p
          style={{
            color: "rgba(99,102,241,0.55)",
            fontSize: 11,
            margin: "0 0 20px",
            fontFamily: FONT_SANS,
          }}
        >
          ← Selector only visible in demo mode
        </p>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "13px 24px",
            borderRadius: 12,
            border: "none",
            background: isLoading
              ? "rgba(59,130,246,0.35)"
              : "linear-gradient(135deg,#3b82f6,#6366f1)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: isLoading
              ? "none"
              : "0 4px 20px rgba(59,130,246,0.4)",
            fontFamily: FONT_SANS,
          }}
        >
          {isLoading ? (
            <>
              <span
                style={{
                  width: 15,
                  height: 15,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Connecting...
            </>
          ) : (
            <>
              {/* Microsoft logo */}
              <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1"   width="9" height="9" fill="#f25022" />
                <rect x="11" y="1"  width="9" height="9" fill="#7fba00" />
                <rect x="1" y="11"  width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              Sign in with Microsoft DE
            </>
          )}
        </button>

        <p
          style={{
            color: "rgba(100,116,139,0.55)",
            fontSize: 12,
            marginTop: 14,
            fontFamily: FONT_SANS,
          }}
        >
          Use your @de.pr or @miescuela.pr account
        </p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────

export default function App() {
  const [currentUser,  setCurrentUser]  = useState(null);
  const [flippedItems, setFlippedItems] = useState(INITIAL_FLIPPED);
  const [assignments,  setAssignments]  = useState(INITIAL_ASSIGNMENTS);
  const [roster,       setRoster]       = useState(INITIAL_ROSTER);

  const handleLogin  = (user) => setCurrentUser(user);
  const handleLogout = ()     => setCurrentUser(null);

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentUser.role === "teacher") {
    return (
      <TeacherPortal
        user={currentUser}
        onLogout={handleLogout}
        flippedItems={flippedItems}
        setFlippedItems={setFlippedItems}
        assignments={assignments}
        setAssignments={setAssignments}
        roster={roster}
        setRoster={setRoster}
      />
    );
  }

  return (
    <StudentPortal
      user={currentUser}
      onLogout={handleLogout}
      flippedItems={flippedItems}
      assignments={assignments}
    />
  );
}
