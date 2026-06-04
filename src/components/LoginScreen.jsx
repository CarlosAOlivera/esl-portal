import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { BACKGROUND_GRADIENT, CARD_STYLE, FONT_SANS, FONT_SERIF } from "../styles/tokens";

const FALLBACK_PIN = "2026";
const FALLBACK_USER = {
  name: "Prof. Carlos Olivera",
  email: "de142118@miescuela.pr",
  avatarInitials: "CO",
  role: "teacher",
};

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFallback, setShowFallback] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(
          authError.message === "Failed to fetch"
            ? "Cannot reach Supabase. Restart the dev server (`npm run dev`) and try again."
            : authError.message
        );
      }
    } catch {
      setError("Cannot reach Supabase. Restart the dev server (`npm run dev`) and try again.");
    } finally {
      setIsLoading(false);
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
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {error && (
          <p
            style={{
              color: "#f87171",
              fontSize: 12,
              margin: "8px 0 0",
              fontFamily: FONT_SANS,
            }}
          >
            {error}
          </p>
        )}

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
              <p
                style={{
                  color: "#f87171",
                  fontSize: 12,
                  margin: "8px 0 0",
                  fontFamily: FONT_SANS,
                }}
              >
                {pinError}
              </p>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
