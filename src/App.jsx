import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { INITIAL_FLIPPED, INITIAL_ASSIGNMENTS, INITIAL_ROSTER } from "./data/mockData";
import LoginScreen from "./components/LoginScreen";
import StudentPortal from "./components/student/HomeView";
import TeacherPortal from "./components/teacher/Dashboard";

const TEACHER_EMAIL = "de142118@miescuela.pr";

function userFromSession(session) {
  const email = session.user.email;
  const role = email === TEACHER_EMAIL ? "teacher" : "student";
  const name = session.user.user_metadata?.full_name || email;
  const nameParts = name.split(" ");
  const initials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : email.slice(0, 2).toUpperCase();
  return { name, email, avatarInitials: initials, role };
}

export default function App() {
  const [currentUser,  setCurrentUser]  = useState(null);
  const [authLoading,  setAuthLoading]  = useState(true);
  const [flippedItems, setFlippedItems] = useState(INITIAL_FLIPPED);
  const [assignments,  setAssignments]  = useState(INITIAL_ASSIGNMENTS);
  const [roster,       setRoster]       = useState(INITIAL_ROSTER);

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
        setFlippedItems={setFlippedItems}
        assignments={assignments}
        setAssignments={setAssignments}
        roster={roster}
        setRoster={setRoster}
      />
    );
  }

  return (
    <StudentPortal
      user={currentUser}
      onLogout={handleLogout}
      flippedItems={flippedItems}
      assignments={assignments}
    />
  );
}
