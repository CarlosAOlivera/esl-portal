// useTutor — manages all AI tutor state for a student assignment session.
// Encapsulates: message history, current input, loading state, elapsed timer,
// usage limits (30 messages / 40 minutes), and the Anthropic API call.
// TutorPanel consumes this hook instead of managing its own state.
//
// API calls go through the local Express proxy in server.js (port 3001).
// The proxy injects the ANTHROPIC_API_KEY server-side — the key never reaches the browser.

import { useState, useEffect } from "react";
import { TUTOR_SYSTEM_PROMPT, fmtTimer } from "../data/mockData";

export const TUTOR_MAX_MESSAGES = 30;
export const TUTOR_MAX_SECONDS  = 40 * 60; // 40 minutes

export function useTutor(activeQuestionIndex, questions) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your ESL tutor. I'll help you think through the questions — but I won't give you the answers directly. Ask me anything! 😊\n\n(Si prefieres español, solo dímelo.)",
    },
  ]);
  const [inputText, setInputText]           = useState("");
  const [isLoading, setIsLoading]           = useState(false);
  const [messageCount, setMessageCount]     = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Increment elapsed time every second, capped at the session limit
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((seconds) =>
        seconds < TUTOR_MAX_SECONDS ? seconds + 1 : seconds
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const secondsRemaining  = TUTOR_MAX_SECONDS - elapsedSeconds;
  const messagesRemaining = TUTOR_MAX_MESSAGES - messageCount;
  const isLocked          =
    elapsedSeconds >= TUTOR_MAX_SECONDS || messageCount >= TUTOR_MAX_MESSAGES;

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || isLocked) return;

    const text            = inputText.trim();
    const updatedMessages = [...messages, { role: "user", content: text }];

    setInputText("");
    setMessages(updatedMessages);
    setMessageCount((count) => count + 1);
    setIsLoading(true);

    try {
      // Requests go through the local Express proxy (server.js) which
      // injects the API key server-side — the key never reaches the browser.
      const response = await fetch("http://localhost:3001/api/anthropic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: TUTOR_SYSTEM_PROMPT(questions[activeQuestionIndex]),
          messages: updatedMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });
      const data = await response.json();
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.content?.[0]?.text || "Sorry, try again.",
        },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    isLoading,
    elapsedSeconds,
    secondsRemaining,
    messagesRemaining,
    isLocked,
    sendMessage,
    fmtTimer,
  };
}
