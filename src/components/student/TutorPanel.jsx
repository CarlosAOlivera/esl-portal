// TutorPanel — the AI tutor chat drawer that slides in from the right.
// Appears when the student clicks "Pedir Ayuda" inside AssignmentView.
// All state (messages, timer, limits) is managed by the useTutor hook.
// The tutor is context-aware: it knows which question the student is on
// and uses a Socratic prompt to guide without giving direct answers.

import { useRef, useEffect } from "react";
import { FONT_SANS } from "../../styles/tokens";
import { useTutor, TUTOR_MAX_SECONDS } from "../../hooks/useTutor";
import eliAvatar from "../../assets/branding/eli-tutor-avatar.png";

function EliAvatar({ size = 28 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "conic-gradient(from 0deg, #E8A020, #3b82f6, #60a5fa, #3b82f6, #E8A020)",
        padding: 2,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          overflow: "hidden",
          background: "#080F1E",
        }}
      >
        <img src={eliAvatar} alt="Eli" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
}

export default function TutorPanel({ activeQuestionIndex, questions, onClose }) {
  const {
    messages,
    inputText,
    setInputText,
    isLoading,
    secondsRemaining,
    messagesRemaining,
    isLocked,
    sendMessage,
    fmtTimer,
  } = useTutor(activeQuestionIndex, questions);

  const bottomRef = useRef(null);

  // Scroll to the latest message whenever the list updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="tutor-panel"
      style={{
        background: "rgba(8,16,32,0.98)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        zIndex: 200,
        backdropFilter: "blur(20px)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <EliAvatar size={36} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              fontFamily: FONT_SANS,
            }}
          >
            Eli
          </div>
          <div
            style={{
              color: "rgba(148,163,184,0.5)",
              fontSize: 11,
              fontFamily: FONT_SANS,
            }}
          >
            {fmtTimer(Math.max(0, secondsRemaining))} · {messagesRemaining} msgs
          </div>
        </div>

        {/* Time-remaining progress bar */}
        <div style={{ width: 50 }}>
          <div
            style={{
              height: 3,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 2,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.max(0, (secondsRemaining / TUTOR_MAX_SECONDS) * 100)}%`,
                background: secondsRemaining < 300 ? "#ef4444" : "#3b82f6",
                borderRadius: 2,
                transition: "width 1s",
              }}
            />
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "rgba(148,163,184,0.5)",
            cursor: "pointer",
            fontSize: 20,
            padding: 2,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* ── Active question context pill ── */}
      <div
        style={{
          padding: "8px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 8,
            padding: "6px 10px",
            fontSize: 11,
            color: "rgba(165,180,252,0.8)",
            fontFamily: FONT_SANS,
          }}
        >
          📌 <strong>P{activeQuestionIndex + 1}:</strong>{" "}
          {questions[activeQuestionIndex]?.text?.slice(0, 65)}…
        </div>
      </div>

      {/* ── Message list ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {messages.map((message, index) =>
          message.role === "user" ? (
            <div key={index} style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  maxWidth: "82%",
                  padding: "8px 12px",
                  borderRadius: "12px 12px 3px 12px",
                  background: "rgba(17,32,64,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e2e8f0",
                  fontSize: 13,
                  lineHeight: 1.6,
                  fontFamily: FONT_SANS,
                  whiteSpace: "pre-wrap",
                }}
              >
                {message.content}
              </div>
            </div>
          ) : (
            <div key={index} style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
              <EliAvatar size={24} />
              <div
                style={{
                  maxWidth: "80%",
                  padding: "8px 12px",
                  borderRadius: "12px 12px 12px 3px",
                  background: "rgba(11,22,46,0.95)",
                  border: "1px solid rgba(59,130,246,0.22)",
                  color: "#fff",
                  fontSize: 13,
                  lineHeight: 1.6,
                  fontFamily: FONT_SANS,
                  whiteSpace: "pre-wrap",
                }}
              >
                {message.content}
              </div>
            </div>
          )
        )}

        {/* Typing indicator */}
        {isLoading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            <EliAvatar size={24} />
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "12px 12px 12px 3px",
                background: "rgba(11,22,46,0.95)",
                border: "1px solid rgba(59,130,246,0.22)",
                display: "flex",
                gap: 5,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((dotIndex) => (
                <div
                  key={dotIndex}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#3b82f6",
                    animation: `bounce 1.2s ease-in-out ${dotIndex * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {isLocked ? (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10,
              padding: "10px",
              color: "#fca5a5",
              fontSize: 12,
              textAlign: "center",
              fontFamily: FONT_SANS,
            }}
          >
            {secondsRemaining <= 0 ? "⏱ 40-minute limit reached" : "💬 Message limit reached"}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 7 }}>
            <textarea
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your question..."
              rows={2}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#fff",
                fontSize: 13,
                padding: "8px 11px",
                fontFamily: FONT_SANS,
                resize: "none",
                outline: "none",
                lineHeight: 1.5,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              style={{
                width: 38,
                borderRadius: 10,
                border: "none",
                background:
                  inputText.trim() && !isLoading
                    ? "linear-gradient(135deg,#3b82f6,#60a5fa)"
                    : "rgba(255,255,255,0.06)",
                color: "#fff",
                cursor:
                  inputText.trim() && !isLoading ? "pointer" : "not-allowed",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              →
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
