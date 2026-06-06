import { useState, useEffect, useCallback } from "react";
import { supabase } from "./lib/supabaseClient";
import { INITIAL_ROSTER } from "./data/mockData";
import LoginScreen from "./components/LoginScreen";
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
  const [currentUser,  setCurrentUser]  = useState(null);
  const [authLoading,  setAuthLoading]  = useState(true);
  const [dataLoading,  setDataLoading]  = useState(true);
  const [flippedItems, setFlippedItems] = useState([]);
  const [assignments,  setAssignments]  = useState([]);
  const [roster,       setRoster]       = useState(INITIAL_ROSTER);

  // Fetch assignments and materials from Supabase
  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [{ data: materialsData }, { data: assignmentsData }] = await Promise.all([
        supabase
          .from("materials")
          .select("*")
          .order("publish_date", { ascending: true }),
        supabase
          .from("assignments")
          .select("*")
          .order("created_at", { ascending: true }),
      ]);
      setFlippedItems((materialsData || []).map(fromMaterialRow));
      setAssignments((assignmentsData || []).map(fromAssignmentRow));
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      setDataLoading(false);
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
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data once auth is ready
  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, fetchData]);

  const handleLogin  = (user) => setCurrentUser(user);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  if (authLoading) return null;

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentUser.role === "teacher") {
    return (
      <TeacherPortal
        user={currentUser}
        onLogout={handleLogout}
        flippedItems={flippedItems}
        assignments={assignments}
        roster={roster}
        setRoster={setRoster}
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
