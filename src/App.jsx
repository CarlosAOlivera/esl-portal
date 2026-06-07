import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabaseClient";
// INITIAL_ROSTER removed — roster now comes from Supabase
import LoginScreen from "./components/LoginScreen";
import GroupSelectScreen from "./components/GroupSelectScreen";
import StudentPortal from "./components/student/HomeView";
import TeacherPortal from "./components/teacher/Dashboard";

const TEACHER_EMAIL = "de142118@miescuela.pr";

// ── Row ↔ camelCase converters ────────────────────────────────────────────────

function fromAssignmentRow(row) {
  return {
    id:           row.id,
    title:        row.title,
    unit:         row.unit,
    instructions: row.instructions || "",
    status:       row.status,
    flippedId:    row.flipped_id || null,
    questions:    row.questions || [],
  };
}

function fromMaterialRow(row) {
  return {
    id:           row.id,
    type:         row.type,
    title:        row.title,
    unit:         row.unit,
    url:          row.url || "",
    description:  row.description || "",
    publishDate:  row.publish_date,
    assignmentId: row.assignment_id || null,
  };
}

// ── Session → user object ─────────────────────────────────────────────────────

function userFromSession(session) {
  const email = session.user.email;
  const role  = email === TEACHER_EMAIL ? "teacher" : "student";
  const name  = session.user.user_metadata?.full_name || email;
  const parts = name.split(" ");
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : email.slice(0, 2).toUpperCase();
  return { name, email, avatarInitials: initials, role };
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [currentUser,   setCurrentUser]   = useState(null);
  const [authLoading,   setAuthLoading]   = useState(true);
  const [dataLoading,   setDataLoading]   = useState(true);
  const [needsGroup,    setNeedsGroup]    = useState(false);
  const [flippedItems,  setFlippedItems]  = useState([]);
  const [assignments,   setAssignments]   = useState([]);
  const [roster,        setRoster]        = useState([]);

  // Fetch assignments, materials, and roster from Supabase
  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [
        { data: materialsData },
        { data: assignmentsData },
        { data: studentsData },
      ] = await Promise.all([
        supabase.from("materials").select("*").order("publish_date", { ascending: true }),
        supabase.from("assignments").select("*").order("created_at", { ascending: true }),
        supabase
          .from("profiles")
          .select(`
            id, full_name, avatar_initials, email, group_number,
            student_responses(id, submitted_at, paste_attempts, tabaway_count)
          `)
          .eq("role", "student")
          .order("group_number", { ascending: true }),
      ]);

      setFlippedItems((materialsData || []).map(fromMaterialRow));
      setAssignments((assignmentsData || []).map(fromAssignmentRow));
      setRoster((studentsData || []).map((s) => ({
        id:             s.id,
        name:           s.full_name || s.email,
        avatarInitials: s.avatar_initials || (s.email?.slice(0, 2).toUpperCase()),
        email:          s.email,
        group:          s.group_number,
        submitted:      (s.student_responses?.length ?? 0) > 0,
        reviewed:       false,
        pasteAttempts:  s.student_responses?.reduce((sum, r) => sum + (r.paste_attempts ?? 0), 0) ?? 0,
        tabawayCount:   s.student_responses?.reduce((sum, r) => sum + (r.tabaway_count ?? 0), 0) ?? 0,
        tutorMinutes:   0,
        tutorMessages:  0,
      })));
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Check if student has a group assigned
  const checkGroup = useCallback(async (user) => {
    if (user.role === "teacher") return;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("group_number")
        .eq("id", (await supabase.auth.getSession()).data.session.user.id)
        .single();
      if (!profile?.group_number) setNeedsGroup(true);
    } catch {
      // If profile check fails, skip — don't block the student
    }
  }, []);

  // Auth session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentUser(userFromSession(session));
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session ? userFromSession(session) : null);
      if (!session) setNeedsGroup(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data + check group once authenticated
  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchData();
      checkGroup(currentUser);
    }
    if (!authLoading && !currentUser) {
      setDataLoading(false);
    }
  }, [authLoading, currentUser, fetchData, checkGroup]);

  const handleLogin  = (user) => setCurrentUser(user);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setNeedsGroup(false);
  };

  if (authLoading) return null;

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Student needs to pick a group on first login
  if (currentUser.role === "student" && needsGroup) {
    return (
      <GroupSelectScreen
        user={currentUser}
        onGroupSelected={() => setNeedsGroup(false)}
      />
    );
  }

  if (currentUser.role === "teacher") {
    return (
      <TeacherPortal
        user={currentUser}
        onLogout={handleLogout}
        flippedItems={flippedItems}
        assignments={assignments}
        roster={roster}
        onRefresh={fetchData}
        dataLoading={dataLoading}
      />
    );
  }

  return (
    <StudentPortal
      user={currentUser}
      onLogout={handleLogout}
      flippedItems={flippedItems}
      assignments={assignments}
      dataLoading={dataLoading}
    />
  );
}
