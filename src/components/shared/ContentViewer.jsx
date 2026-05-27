// ContentViewer renders the appropriate media player or embed for a flipped item.
//
// Supported types:
//   video   → YouTube-compatible iframe (converts watch?v= to embed/)
//   podcast → HTML <audio> element with a NotebookLM-branded header
//   pdf     → iframe viewer with an "open in new tab" escape link
//   website → centered link card with description and open button
//
// Shows a placeholder card with the type icon when item.url is empty.

import { FONT_SANS } from "../../styles/tokens";
import { CONTENT_TYPES } from "../../data/mockData";

export default function ContentViewer({ item }) {
  const typeConfig = CONTENT_TYPES[item.type] || CONTENT_TYPES.video;

  if (!item.url) {
    return (
      <div
        style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.07)",
          padding: "36px 20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>{typeConfig.icon}</div>
        <p
          style={{
            color: "rgba(148,163,184,0.4)",
            fontSize: 13,
            fontFamily: FONT_SANS,
            margin: 0,
          }}
        >
          Content not available yet
        </p>
      </div>
    );
  }

  if (item.type === "video") {
    return (
      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.07)",
          aspectRatio: "16/9",
        }}
      >
        <iframe
          src={item.url.replace("watch?v=", "embed/")}
          style={{ width: "100%", height: "100%", border: "none" }}
          allowFullScreen
          title={item.title}
        />
      </div>
    );
  }

  if (item.type === "podcast") {
    return (
      <div
        style={{
          background: "rgba(34,211,238,0.06)",
          border: "1px solid rgba(34,211,238,0.2)",
          borderRadius: 14,
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "rgba(34,211,238,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🎙
          </div>
          <div>
            <div
              style={{
                color: "#22d3ee",
                fontWeight: 600,
                fontSize: 12,
                fontFamily: FONT_SANS,
              }}
            >
              NotebookLM Podcast
            </div>
            <div
              style={{
                color: "rgba(148,163,184,0.6)",
                fontSize: 11,
                fontFamily: FONT_SANS,
              }}
            >
              {item.title}
            </div>
          </div>
        </div>
        <audio controls style={{ width: "100%", accentColor: "#22d3ee" }}>
          <source src={item.url} />
          Your browser does not support audio.
        </audio>
        <p
          style={{
            color: "rgba(148,163,184,0.5)",
            fontSize: 11,
            margin: "8px 0 0",
            fontFamily: FONT_SANS,
          }}
        >
          💡 Use headphones and take notes as you listen.
        </p>
      </div>
    );
  }

  if (item.type === "pdf") {
    return (
      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(248,113,113,0.2)",
        }}
      >
        <div
          style={{
            background: "rgba(248,113,113,0.08)",
            padding: "9px 14px",
            display: "flex",
            alignItems: "center",
            gap: 7,
            borderBottom: "1px solid rgba(248,113,113,0.15)",
          }}
        >
          <span>📄</span>
          <span
            style={{
              color: "#f87171",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: FONT_SANS,
            }}
          >
            PDF Reading
          </span>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            style={{
              marginLeft: "auto",
              color: "rgba(148,163,184,0.6)",
              fontSize: 11,
              fontFamily: FONT_SANS,
              textDecoration: "none",
            }}
          >
            Open in new tab ↗
          </a>
        </div>
        <iframe
          src={item.url + "#toolbar=0"}
          style={{ width: "100%", height: 460, border: "none", display: "block" }}
          title={item.title}
        />
      </div>
    );
  }

  if (item.type === "website") {
    return (
      <div
        style={{
          background: "rgba(52,211,153,0.06)",
          border: "1px solid rgba(52,211,153,0.2)",
          borderRadius: 14,
          padding: "24px 20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 10 }}>🌐</div>
        <div
          style={{
            color: "#fff",
            fontWeight: 600,
            fontSize: 15,
            fontFamily: FONT_SANS,
            marginBottom: 5,
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            color: "rgba(148,163,184,0.6)",
            fontSize: 13,
            fontFamily: FONT_SANS,
            marginBottom: 18,
            lineHeight: 1.5,
          }}
        >
          {item.description}
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            padding: "10px 22px",
            borderRadius: 10,
            background: "linear-gradient(135deg,#34d399,#059669)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 13,
            fontFamily: FONT_SANS,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(52,211,153,0.3)",
          }}
        >
          Open website ↗
        </a>
        <p
          style={{
            color: "rgba(148,163,184,0.4)",
            fontSize: 11,
            margin: "12px 0 0",
            fontFamily: FONT_SANS,
          }}
        >
          {item.url}
        </p>
      </div>
    );
  }

  return null;
}
