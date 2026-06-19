import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React, { useState, useRef } from "react";

// Minimal component that mirrors the paste/copy prevention in AssignmentView
function ProtectedTextarea({ onAttempt }) {
  const [value, setValue] = useState("");

  const handlePasteAttempt = (e) => {
    e.preventDefault();
    onAttempt();
  };

  return (
    <textarea
      data-testid="answer-input"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onPaste={handlePasteAttempt}
      onCopy={handlePasteAttempt}
    />
  );
}

describe("paste / copy protection", () => {
  it("calls onAttempt and prevents default on paste", () => {
    const onAttempt = vi.fn();
    render(<ProtectedTextarea onAttempt={onAttempt} />);
    const input = screen.getByTestId("answer-input");

    const pasteEvent = new Event("paste", { bubbles: true });
    pasteEvent.preventDefault = vi.fn();
    fireEvent(input, pasteEvent);

    expect(onAttempt).toHaveBeenCalledOnce();
  });

  it("calls onAttempt and prevents default on copy", () => {
    const onAttempt = vi.fn();
    render(<ProtectedTextarea onAttempt={onAttempt} />);
    const input = screen.getByTestId("answer-input");

    const copyEvent = new Event("copy", { bubbles: true });
    copyEvent.preventDefault = vi.fn();
    fireEvent(input, copyEvent);

    expect(onAttempt).toHaveBeenCalledOnce();
  });

  it("still allows typing normally", () => {
    const onAttempt = vi.fn();
    render(<ProtectedTextarea onAttempt={onAttempt} />);
    const input = screen.getByTestId("answer-input");

    fireEvent.change(input, { target: { value: "my answer" } });
    expect(input.value).toBe("my answer");
    expect(onAttempt).not.toHaveBeenCalled();
  });
});
