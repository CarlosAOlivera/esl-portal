import { describe, it, expect } from "vitest";

const TEACHER_EMAIL = "de142118@miescuela.pr";

function getRole(email) {
  return email === TEACHER_EMAIL ? "teacher" : "student";
}

describe("role detection", () => {
  it("assigns teacher role to the teacher email", () => {
    expect(getRole("de142118@miescuela.pr")).toBe("teacher");
  });

  it("assigns student role to any other email", () => {
    expect(getRole("student1@miescuela.pr")).toBe("student");
    expect(getRole("de142118@gmail.com")).toBe("student");
    expect(getRole("DE142118@miescuela.pr")).toBe("student"); // case-sensitive
  });

  it("assigns student role to empty string", () => {
    expect(getRole("")).toBe("student");
  });
});
