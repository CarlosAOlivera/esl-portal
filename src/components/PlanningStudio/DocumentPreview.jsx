import { CARD_STYLE, FONT_SANS, FONT_SERIF } from "../../styles/tokens";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/* ── Markdown helpers (screen rendering) ───────────────────────────────────── */
function esc(t) {
  return String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function inlineMd(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}
function mdToHtml(md) {
  if (!md) return "";
  const lines = md.split("\n");
  const out = [];
  let tableBuf = [];

  const flushTable = () => {
    if (!tableBuf.length) return;
    const rows = tableBuf.filter((l) => !/^\|[\s\-:|]+\|$/.test(l.trim()));
    if (!rows.length) { tableBuf = []; return; }
    const cells = (r) => r.split("|").slice(1, -1).map((c) => c.trim());
    const [hRow, ...bRows] = rows;
    out.push(
      `<table><thead><tr>${cells(hRow).map((c) => `<th>${inlineMd(c)}</th>`).join("")}</tr></thead>` +
      `<tbody>${bRows.map((r) => `<tr>${cells(r).map((c) => `<td>${inlineMd(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`
    );
    tableBuf = [];
  };

  for (const line of lines) {
    if (line.startsWith("|")) { tableBuf.push(line); continue; }
    if (tableBuf.length) flushTable();
    if (/^### /.test(line)) { out.push(`<h3>${inlineMd(line.slice(4))}</h3>`); continue; }
    if (/^## /.test(line))  { out.push(`<h2>${inlineMd(line.slice(3))}</h2>`); continue; }
    if (/^# /.test(line))   { out.push(`<h1>${inlineMd(line.slice(2))}</h1>`); continue; }
    if (/^-{3,}$/.test(line.trim())) { out.push("<hr>"); continue; }
    if (/^[*\-] /.test(line))        { out.push(`<li>${inlineMd(line.slice(2))}</li>`); continue; }
    if (/^\d+\. /.test(line))        { out.push(`<li>${inlineMd(line.replace(/^\d+\.\s/, ""))}</li>`); continue; }
    if (/^> /.test(line))            { out.push(`<blockquote>${inlineMd(line.slice(2))}</blockquote>`); continue; }
    if (line.trim() === "")          { out.push("<br>"); continue; }
    out.push(`<p>${inlineMd(line)}</p>`);
  }
  if (tableBuf.length) flushTable();
  return out.join("\n");
}

/* ── JSON plan parser ──────────────────────────────────────────────────────── */
function parsePlan(content) {
  if (!content) return null;
  try {
    // Try ```json ... ``` fence
    const fence = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) return JSON.parse(fence[1].trim());
    // Try bare JSON with "days" key (whole string or a substring)
    const bare = content.match(/\{[\s\S]*?"days"[\s\S]*\}/);
    if (bare) return JSON.parse(bare[0]);
    // Try parsing the whole thing
    return JSON.parse(content.trim());
  } catch {}
  return null;
}

/* ── DE weekly HTML builder (for print window) ─────────────────────────────── */
function buildDEHtml(doc, plan) {
  const d = (day, key) => {
    const v = plan.days?.[day]?.[key];
    if (v == null) return "—";
    if (Array.isArray(v)) return v.map((x, i) => `${i + 1}. ${esc(x)}`).join("<br>");
    return esc(String(v));
  };

  const tr = (label, key) =>
    `<tr><td class="elem">${label}</td>${DAYS.map((day) => `<td>${d(day, key)}</td>`).join("")}</tr>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${esc(doc.title)}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 8pt; color: #000; padding: 15px 20px; }
.hdr { border-bottom: 2px solid #000; padding-bottom: 7px; margin-bottom: 10px; }
.hdr-title { font-size: 12pt; font-weight: bold; }
.week { font-weight: bold; font-size: 9pt; margin-bottom: 8px; }
table { border-collapse: collapse; width: 100%; }
td, th { border: 1px solid #888; padding: 4px 5px; vertical-align: top; font-size: 7.5pt; }
.info td { font-size: 8pt; }
.info { margin-bottom: 10px; }
thead th { background: #5b8ecf; color: #fff; text-align: center; font-weight: bold; font-size: 8pt; }
.elem { background: #dce8f5; font-weight: bold; font-size: 7pt; width: 90px;
        text-transform: uppercase; letter-spacing: 0.03em; vertical-align: middle; }
.span-row td { background: #e4e4e4; font-weight: bold; text-align: center; font-size: 7.5pt; }
.footer { font-size: 7pt; color: #666; text-align: right; margin-top: 8px; font-style: italic; }
@page { size: landscape; margin: 1cm; }
</style>
</head>
<body>
<div class="hdr">
  <div class="hdr-title">DEPARTAMENTO DE EDUCACIÓN &nbsp;|&nbsp; English 12 | Weekly Plan (Regular Teacher)</div>
</div>

<div class="week">Week ${esc(plan.week || "")}</div>

<table class="info">
  <tr>
    <td style="width:50%"><strong>Teacher's Name:</strong> Prof. Carlos Olivera</td>
    <td><strong>Date:</strong> _______________</td>
  </tr>
  <tr>
    <td><strong>Grade:</strong> Twelfth Grade</td>
    <td><strong>Subject (Course):</strong> English</td>
  </tr>
  <tr>
    <td><strong>Theme:</strong> ${esc(plan.theme || "")}</td>
    <td><strong>Unit:</strong> ${esc(doc.unit || "")}</td>
  </tr>
  <tr>
    <td>
      <strong>Transversal Themes:</strong><br>
      ${(plan.transversalThemes || ["Equity and Respect among All Human Beings"])
        .map((t) => `☒ ${esc(t)}`).join("<br>")}
    </td>
    <td>
      <strong>Generator Themes:</strong><br>
      ${(plan.generatorThemes || ["Diversity"])
        .map((t) => `☒ ${esc(t)}`).join("<br>")}
    </td>
  </tr>
</table>

<table>
  <thead>
    <tr>
      <th style="width:90px">Elements</th>
      ${DAYS.map((d) => `<th>${d}</th>`).join("")}
    </tr>
  </thead>
  <tbody>
    ${tr("Standards", "standards")}
    ${tr("Expectations or Indicators", "indicators")}
    ${tr("Objectives", "objectives")}
    <tr class="span-row"><td colspan="6">Sequence of Learning Activities</td></tr>
    ${tr("Initial", "initial")}
    ${tr("Developing", "developing")}
    ${tr("Closing", "closing")}
    ${tr("Integration with other subjects", "integration")}
    <tr class="span-row"><td colspan="6">Initiative or Innovative Project</td></tr>
    <tr><td class="elem"></td>${DAYS.map(() => `<td style="height:30px"></td>`).join("")}</tr>
    ${tr("Evaluation", "evaluation")}
    ${tr("Reasonable Accommodations", "accommodations")}
    ${tr("Materials", "materials")}
    <tr class="span-row"><td colspan="6">Reflection on the lesson (praxis) Did this work well? Could this have been done better?</td></tr>
    <tr><td class="elem"></td>${DAYS.map(() => `<td style="height:40px"></td>`).join("")}</tr>
  </tbody>
</table>

<div class="footer">*Transversal Theme of Equity and Respect among All Human Beings</div>
</body>
</html>`;
}

/* ── Generic HTML builder (for print window, non-plan docs) ─────────────────── */
function buildGenericHtml(doc) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${esc(doc.title)}</title>
<style>
body { font-family: Georgia, serif; padding: 40px 50px; color: #000; font-size: 11pt; line-height: 1.7; max-width: 820px; }
.hdr { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
h1 { font-size: 17pt; margin: 0 0 6px; }
h2 { font-size: 13pt; margin: 16px 0 5px; border-bottom: 1px solid #ccc; padding-bottom: 3px; }
h3 { font-size: 11pt; margin: 12px 0 4px; }
.meta { font-size: 9.5pt; color: #444; line-height: 1.9; }
table { border-collapse: collapse; width: 100%; margin: 10px 0; }
td, th { border: 1px solid #aaa; padding: 5px 7px; vertical-align: top; }
th { background: #f0f0f0; font-weight: bold; text-align: left; }
blockquote { border-left: 3px solid #ccc; padding-left: 10px; color: #555; margin: 6px 0; font-style: italic; }
li { margin: 3px 0; }
hr { border: none; border-top: 1px solid #ddd; margin: 14px 0; }
code { background: #f4f4f4; padding: 1px 4px; border-radius: 3px; font-size: 10pt; }
</style>
</head>
<body>
<div class="hdr">
  <h1>${esc(doc.title)}</h1>
  <div class="meta">
    <strong>Escuela Superior Fernando Suria Chaves</strong> — Barceloneta, Puerto Rico<br>
    Teacher: Prof. Carlos Olivera &nbsp;|&nbsp; PR Department of Education · Grade 12 ESL<br>
    <strong>Document:</strong> ${esc(doc.docType)} &nbsp;·&nbsp;
    <strong>Unit:</strong> ${esc(doc.unit || "")} &nbsp;·&nbsp;
    <strong>Skill:</strong> ${esc(doc.skill || "")} &nbsp;·&nbsp;
    <strong>Level:</strong> ${esc(doc.proficiency || "")}<br>
    <strong>Generated:</strong> ${esc(doc.generatedAt || "")}
  </div>
</div>
${mdToHtml(doc.content)}
</body>
</html>`;
}

/* ── Print handler ──────────────────────────────────────────────────────────── */
function openPrint(doc, plan) {
  const html = plan ? buildDEHtml(doc, plan) : buildGenericHtml(doc);
  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow pop-ups for this site to use Print / Save PDF.");
    return;
  }
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

/* ── On-screen DE weekly table ──────────────────────────────────────────────── */
function DETable({ plan }) {
  const dayVal = (day, key) => {
    const v = plan.days?.[day]?.[key];
    if (v == null) return <span style={{ color: "rgba(148,163,184,0.3)", fontSize: 11 }}>—</span>;
    if (Array.isArray(v))
      return (
        <ol style={{ margin: 0, paddingLeft: 16 }}>
          {v.map((x, i) => (
            <li key={i} style={{ marginBottom: 3 }}>{x}</li>
          ))}
        </ol>
      );
    return v;
  };

  const TH = {
    background: "rgba(26,48,96,0.9)",
    color: "#93c5fd",
    padding: "7px 9px",
    fontSize: 10,
    fontWeight: 700,
    textAlign: "center",
    border: "1px solid rgba(255,255,255,0.09)",
    fontFamily: FONT_SANS,
    whiteSpace: "nowrap",
  };
  const TD = {
    padding: "7px 9px",
    fontSize: 11,
    color: "#cbd5e1",
    border: "1px solid rgba(255,255,255,0.07)",
    verticalAlign: "top",
    fontFamily: FONT_SANS,
    lineHeight: 1.6,
  };
  const ELEM = {
    ...TD,
    background: "rgba(26,48,96,0.5)",
    color: "#93c5fd",
    fontWeight: 700,
    fontSize: 9,
    width: 100,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };
  const SPAN = {
    ...TD,
    background: "rgba(99,102,241,0.15)",
    color: "#a78bfa",
    fontWeight: 700,
    textAlign: "center",
    fontSize: 10,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };

  const Row = ({ label, k }) => (
    <tr>
      <td style={ELEM}>{label}</td>
      {DAYS.map((day) => (
        <td key={day} style={TD}>{dayVal(day, k)}</td>
      ))}
    </tr>
  );

  return (
    <div>
      {/* Plan meta */}
      <div
        style={{
          marginBottom: 16,
          padding: "12px 14px",
          background: "rgba(26,48,96,0.45)",
          borderRadius: 9,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ color: "#93c5fd", fontSize: 10, fontWeight: 700, marginBottom: 2, fontFamily: FONT_SANS, letterSpacing: "0.05em" }}>
          WEEK {plan.week}
        </div>
        <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, fontFamily: FONT_SERIF, marginBottom: 4 }}>
          {plan.theme}
        </div>
        <div style={{ color: "rgba(148,163,184,0.6)", fontSize: 11, fontFamily: FONT_SANS }}>
          {[...(plan.transversalThemes || []), ...(plan.generatorThemes || [])].join(" · ")}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 820 }}>
          <thead>
            <tr>
              <th style={{ ...TH, width: 100 }}>Elements</th>
              {DAYS.map((d) => (
                <th key={d} style={TH}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Standards" k="standards" />
            <Row label="Indicators" k="indicators" />
            <Row label="Objectives" k="objectives" />
            <tr><td colSpan={6} style={SPAN}>Sequence of Learning Activities</td></tr>
            <Row label="Initial" k="initial" />
            <Row label="Developing" k="developing" />
            <Row label="Closing" k="closing" />
            <Row label="Integration" k="integration" />
            <Row label="Evaluation" k="evaluation" />
            <Row label="Materials" k="materials" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
export default function DocumentPreview({ document, onClose }) {
  const plan = document.docType === "Lesson Plan" ? parsePlan(document.content) : null;

  const unitAbbrev = document.unit
    ? document.unit.replace(/\s*\(.*?\)\s*/g, "").trim()
    : document.unit;

  return (
    <div style={{ ...CARD_STYLE, width: "100%", padding: 24 }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <h3
          style={{
            margin: 0,
            flexGrow: 1,
            color: "#fff",
            fontFamily: FONT_SERIF,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {document.title}
        </h3>
        <button
          onClick={() => openPrint(document, plan)}
          style={{
            padding: "8px 16px",
            borderRadius: 9,
            border: "none",
            background: "linear-gradient(135deg,#3b82f6,#6366f1)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONT_SANS,
            flexShrink: 0,
          }}
        >
          Print / Save PDF
        </button>
        <button
          onClick={onClose}
          style={{
            padding: "8px 14px",
            borderRadius: 9,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "#e2e8f0",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONT_SANS,
            flexShrink: 0,
          }}
        >
          ← Back
        </button>
      </div>

      {/* Meta chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 18,
        }}
      >
        {[document.docType, unitAbbrev, document.skill, document.proficiency]
          .filter(Boolean)
          .map((label) => (
            <span
              key={label}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 20,
                padding: "3px 12px",
                fontSize: 11,
                color: "rgba(148,163,184,0.9)",
                fontFamily: FONT_SANS,
                fontWeight: 500,
              }}
            >
              {label}
            </span>
          ))}
        {plan && (
          <span
            style={{
              background: "rgba(52,211,153,0.12)",
              border: "1px solid rgba(52,211,153,0.3)",
              borderRadius: 20,
              padding: "3px 12px",
              fontSize: 11,
              color: "#34d399",
              fontFamily: FONT_SANS,
              fontWeight: 600,
            }}
          >
            ✓ Formato DE Semanal
          </span>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          maxHeight: "62vh",
          overflowY: "auto",
          overflowX: plan ? "auto" : "hidden",
        }}
      >
        {plan ? (
          <DETable plan={plan} />
        ) : (
          <div
            className="ps-content"
            style={{
              fontFamily: FONT_SANS,
              fontSize: 13,
              color: "#e2e8f0",
              lineHeight: 1.8,
            }}
            /* Content comes from Claude API — trusted source */
            dangerouslySetInnerHTML={{ __html: mdToHtml(document.content) }}
          />
        )}
      </div>

      {/* Inline styles for markdown content */}
      <style>{`
        .ps-content h1, .ps-content h2, .ps-content h3 { color: #e2e8f0; margin: 14px 0 6px; }
        .ps-content h2 { font-size: 15px; }
        .ps-content h3 { font-size: 13px; }
        .ps-content table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        .ps-content th { background: rgba(26,48,96,0.7); color: #93c5fd; border: 1px solid rgba(255,255,255,0.1); padding: 6px 8px; }
        .ps-content td { border: 1px solid rgba(255,255,255,0.08); padding: 6px 8px; color: #cbd5e1; }
        .ps-content blockquote { border-left: 3px solid rgba(232,160,32,0.5); padding-left: 10px; color: rgba(148,163,184,0.8); }
        .ps-content hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 12px 0; }
        .ps-content li { margin: 3px 0; }
        .ps-content code { background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 4px; font-size: 12px; }
        .ps-content strong { color: #e2e8f0; }
      `}</style>
    </div>
  );
}
