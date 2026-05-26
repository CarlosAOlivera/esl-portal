// Proxy server — forwards POST /api/anthropic to api.anthropic.com/v1/messages.
// Uses Node's native fetch (available since Node 18) — no proxy middleware needed.
// Runs on port 3001 alongside the Vite dev server (port 5173).
//
// Start with: node server.js
// Keep running in a separate terminal while `npm run dev` is also running.

import "dotenv/config";
import express from "express";

const app = express();
const PORT = 3001;
const VITE_ORIGIN = "http://localhost:5173";

// Parse incoming JSON bodies so req.body is available
app.use(express.json());

// CORS — allow requests from the Vite dev server on every response
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", VITE_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ── Anthropic proxy ───────────────────────────────────────────────────────────
app.post("/api/anthropic", async (req, res) => {
  console.log("[proxy] Request received — model:", req.body?.model, "| messages:", req.body?.messages?.length);
  try {
    const anthropicResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(req.body),
      }
    );

    console.log("[proxy] Anthropic status:", anthropicResponse.status);
    const data = await anthropicResponse.json();
    if (!anthropicResponse.ok) {
      console.error("[proxy] Anthropic error body:", JSON.stringify(data));
    }
    res.status(anthropicResponse.status).json(data);
  } catch (err) {
    console.error("[proxy] Fetch error:", err.message);
    res.status(502).json({ error: "Proxy error", detail: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log(`Forwarding /api/anthropic → https://api.anthropic.com/v1/messages`);
  const key = process.env.ANTHROPIC_API_KEY || "";
  console.log("API Key loaded:", key ? "YES" : "NO");
  console.log("API Key preview:", key ? `${key.slice(0, 20)}...${key.slice(-6)} (length: ${key.length})` : "MISSING");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Kill the existing process and retry.`);
  } else {
    console.error("Server error:", err.message);
  }
  process.exit(1);
});
