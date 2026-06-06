import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { BACKGROUND_GRADIENT, CARD_STYLE, FONT_SANS, FONT_SERIF } from "../styles/tokens";

const FALLBACK_PIN   = "2026";
const CLASS_CODE     = "SURIA2026";
const FALLBACK_USER  = {
  name: "Prof. Carlos Olivera",
  email: "de142118@miescuela.pr",
  avatarInitials: "CO",
  role: "teacher",
};

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");
}

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"

  // Sign-in state
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState(null);

  // Sign-up state
  const [fullName, setFullName]       = useState("");
  const [regEmail, setRegEmail]       = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [classCode, setClassCode]     = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError]       = useState(null);
  const [regSuccess, setRegSuccess]   = useState(false);

  // Fallback teacher PIN
  const [showFallback, setShowFallback] = useState(false);
  const [pinInput, setPinInput]         = useState("");
  const [pinError, setPinError]         = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(
          authError.message === "Failed to fetch"
            ? "Cannot reach the server. Check your connection and try again."
            : authError.message
        );
      }
    } catch {
      setError("Cannot reach the server. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setRegError(null);

    if (classCode.trim().toUpperCase() !== CLASS_CODE) {
      setRegError("Incorrect class code. Ask your teacher for the code.");
      return;
    }
    if (regPassword.length < 8) {
      setRegError("Password must be at least 8 characters.");
      return;
    }

    setIsRegistering(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: fullName.trim(),
            avatar_initials: getInitials(fullName),
          },
        },
      });
      if (authError) {
        setRegError(authError.message);
      } else {
        setRegSuccess(true);
      }
    } catch {
      setRegError("Cannot reach the server. Check your connection and try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handlePinLogin = () => {
    if (pinInput === FALLBACK_PIN) {
      onLogin(FALLBACK_USER);
    } else {
      setPinError("Incorrect PIN.");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: 14,
    fontFamily: FONT_SANS,
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 10,
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
      {/* Background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.05) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "12%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)",
        }}
      />

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
        {/* Logo */}
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
            margin: "0 0 24px",
            fontFamily: FONT_SANS,
          }}
        >
          Portal · 2026–2027
        </p>

        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10,
            padding: 3,
            marginBottom: 24,
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {["signin", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setRegError(null); setRegSuccess(false); }}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                border: "none",
                background: mode === m ? "rgba(59,130,246,0.25)" : "transparent",
                color: mode === m ? "#60a5fa" : "rgba(148,163,184,0.5)",
                fontSize: 13,
                fontWeight: mode === m ? 600 : 400,
                cursor: "pointer",
                fontFamily: FONT_SANS,
                transition: "all 0.15s",
              }}
            >
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* ── Sign In form ── */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn}>
            <input
              type="email"
              placeholder="School email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0 }}
              required
            />

            {error && (
              <p style={{ color: "#f87171", fontSize: 12, margin: "8px 0 0", fontFamily: FONT_SANS }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "13px 24px",
                borderRadius: 12,
                border: "none",
                background: isLoading
                  ? "rgba(59,130,246,0.2)"
                  : "linear-gradient(135deg,#3b82f6,#6366f1)",
                color: isLoading ? "rgba(255,255,255,0.4)" : "#fff",
                fontSize: 15,
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: isLoading ? "none" : "0 4px 20px rgba(59,130,246,0.4)",
                fontFamily: FONT_SANS,
                marginTop: 14,
              }}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        )}

        {/* ── Create Account form ── */}
        {mode === "signup" && !regSuccess && (
          <form onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="Full name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={inputStyle}
              required
            />
            <input
              type="email"
              placeholder="School email"
              autoComplete="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              style={inputStyle}
              required
            />
            <input
              type="password"
              placeholder="Create a password (min 8 characters)"
              autoComplete="new-password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              style={inputStyle}
              required
            />
            <input
              type="text"
              placeholder="Class code (ask your teacher)"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0 }}
              required
            />

            {regError && (
              <p style={{ color: "#f87171", fontSize: 12, margin: "8px 0 0", fontFamily: FONT_SANS }}>
                {regError}
              </p>
            )}

            <button
              type="submit"
              disabled={isRegistering}
              style={{
                width: "100%",
                padding: "13px 24px",
                borderRadius: 12,
                border: "none",
                background: isRegistering
                  ? "rgba(0,180,160,0.2)"
                  : "linear-gradient(135deg,#00B4A0,#00D4BC)",
                color: isRegistering ? "rgba(255,255,255,0.4)" : "#0A1628",
                fontSize: 15,
                fontWeight: 700,
                cursor: isRegistering ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: isRegistering ? "none" : "0 4px 20px rgba(0,180,160,0.35)",
                fontFamily: FONT_SANS,
                marginTop: 14,
              }}
            >
              {isRegistering ? (
                <>
                  <Spinner color="#00B4A0" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}

        {/* ── Registration success ── */}
        {mode === "signup" && regSuccess && (
          <div
            style={{
              padding: "24px 16px",
              borderRadius: 12,
              background: "rgba(0,180,160,0.08)",
              border: "1px solid rgba(0,180,160,0.25)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>✉️</div>
            <div
              style={{
                color: "#00D4BC",
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 8,
                fontFamily: FONT_SERIF,
              }}
            >
              Check your email
            </div>
            <p
              style={{
                color: "rgba(148,163,184,0.7)",
                fontSize: 13,
                fontFamily: FONT_SANS,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              We sent a confirmation link to <strong style={{ color: "#e2e8f0" }}>{regEmail}</strong>.
              Click it to activate your account, then come back here to sign in.
            </p>
            <button
              onClick={() => { setMode("signin"); setRegSuccess(false); }}
              style={{
                marginTop: 18,
                background: "none",
                border: "none",
                color: "#60a5fa",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: FONT_SANS,
                textDecoration: "underline",
              }}
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Hint text */}
        {mode === "signin" && (
          <p
            style={{
              color: "rgba(100,116,139,0.55)",
              fontSize: 12,
              margin: "14px 0 0",
              fontFamily: FONT_SANS,
            }}
          >
            Use your school email and password
          </p>
        )}
        {mode === "signup" && !regSuccess && (
          <p
            style={{
              color: "rgba(100,116,139,0.55)",
              fontSize: 12,
              margin: "14px 0 0",
              fontFamily: FONT_SANS,
            }}
          >
            You need the class code from Prof. Olivera to register.
          </p>
        )}

        {/* Teacher fallback */}
        {mode === "signin" && (
          <>
            <button
              onClick={() => setShowFallback((v) => !v)}
              style={{
                background: "none",
                border: "none",
                color: "rgba(99,102,241,0.6)",
                fontSize: 12,
                cursor: "pointer",
                marginTop: 16,
                fontFamily: FONT_SANS,
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Teacher fallback login →
            </button>

            {showFallback && (
              <div
                style={{
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 12,
                  padding: 16,
                  marginTop: 16,
                  textAlign: "left",
                }}
              >
                <p
                  style={{
                    color: "rgba(99,102,241,0.7)",
                    fontSize: 11,
                    margin: "0 0 12px",
                    fontFamily: FONT_SANS,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Teacher Demo Login
                </p>

                <input
                  type="email"
                  value="de142118@miescuela.pr"
                  readOnly
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(148,163,184,0.5)",
                    fontSize: 13,
                    fontFamily: FONT_SANS,
                    marginBottom: 8,
                    boxSizing: "border-box",
                    cursor: "not-allowed",
                  }}
                />

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="password"
                    placeholder="PIN"
                    value={pinInput}
                    onChange={(e) => { setPinInput(e.target.value); setPinError(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handlePinLogin(); }}
                    style={{
                      flex: 1,
                      padding: "9px 12px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.05)",
                      color: "#fff",
                      fontSize: 13,
                      fontFamily: FONT_SANS,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={handlePinLogin}
                    style={{
                      padding: "9px 18px",
                      borderRadius: 8,
                      border: "none",
                      background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: FONT_SANS,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Enter
                  </button>
                </div>

                {pinError && (
                  <p style={{ color: "#f87171", fontSize: 12, margin: "8px 0 0", fontFamily: FONT_SANS }}>
                    {pinError}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

function Spinner({ color = "#fff" }) {
  return (
    <span
      style={{
        width: 15,
        height: 15,
        border: `2px solid ${color === "#fff" ? "rgba(255,255,255,0.3)" : "rgba(0,180,160,0.3)"}`,
        borderTopColor: color,
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}
