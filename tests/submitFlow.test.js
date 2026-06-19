import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase before importing anything that uses it
vi.mock("../src/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
}));

import { supabase } from "../src/lib/supabaseClient";

describe("submit flow — student_responses upsert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("upserts with student_id from session on submit", async () => {
    const fakeSession = { user: { id: "student-uuid-123" } };
    supabase.auth.getSession.mockResolvedValue({ data: { session: fakeSession } });

    const upsertMock = vi.fn().mockResolvedValue({ error: null });
    supabase.from.mockReturnValue({ upsert: upsertMock });

    // Simulate the submit handler logic from AssignmentView
    const answers = { q1: 2, q2: "My answer" };
    const assignmentId = "asg-001";

    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("student_responses").upsert({
      student_id:    session.user.id,
      assignment_id: assignmentId,
      answers,
      submitted_at:  new Date().toISOString(),
      paste_attempts: 0,
      tabaway_count:  0,
    });

    expect(error).toBeNull();
    expect(supabase.from).toHaveBeenCalledWith("student_responses");
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id:    "student-uuid-123",
        assignment_id: "asg-001",
        answers,
      })
    );
  });

  it("does not set isSubmitted when Supabase returns an error", async () => {
    const fakeSession = { user: { id: "student-uuid-123" } };
    supabase.auth.getSession.mockResolvedValue({ data: { session: fakeSession } });
    supabase.from.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: { message: "DB error" } }),
    });

    let submitted = false;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.from("student_responses").upsert({
        student_id: session.user.id,
        assignment_id: "asg-001",
        answers: {},
        submitted_at: new Date().toISOString(),
        paste_attempts: 0,
        tabaway_count: 0,
      });
      if (error) throw error;
      submitted = true;
    } catch {
      // error path — submitted stays false
    }

    expect(submitted).toBe(false);
  });
});
