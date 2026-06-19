import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Helper: build a UTC date that corresponds to a given PR local time
// PR = UTC-4 (no DST)
function prTime(hour, minute = 0) {
  const utcHour = (hour + 4) % 24;
  const d = new Date();
  d.setUTCHours(utcHour, minute, 0, 0);
  return d;
}

function checkTime(date) {
  const prHour   = (date.getUTCHours() - 4 + 24) % 24;
  const prMinute = date.getUTCMinutes();
  const minutes  = prHour * 60 + prMinute;
  return minutes >= 450 && minutes <= 870; // 7:30–14:30
}

describe("school hours gating (PR time, UTC-4)", () => {
  it("allows access at 7:30 AM PR", () => {
    expect(checkTime(prTime(7, 30))).toBe(true);
  });

  it("allows access at 12:00 PM PR", () => {
    expect(checkTime(prTime(12, 0))).toBe(true);
  });

  it("allows access at 2:30 PM PR", () => {
    expect(checkTime(prTime(14, 30))).toBe(true);
  });

  it("blocks access at 7:29 AM PR", () => {
    expect(checkTime(prTime(7, 29))).toBe(false);
  });

  it("blocks access at 2:31 PM PR", () => {
    expect(checkTime(prTime(14, 31))).toBe(false);
  });

  it("blocks access at midnight PR", () => {
    expect(checkTime(prTime(0, 0))).toBe(false);
  });

  it("blocks access at 11:59 PM PR", () => {
    expect(checkTime(prTime(23, 59))).toBe(false);
  });
});
