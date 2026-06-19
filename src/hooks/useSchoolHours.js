// useSchoolHours — returns true while the portal is within school hours.
// School hours are 7:30am–2:30pm (minutes 450–870 since midnight) in PR time (UTC-4).
// In development (import.meta.env.DEV) it always returns true so you can test any time.
// The hook re-checks every 60 seconds, so the UI responds if the session
// crosses a boundary without a page reload.

import { useState, useEffect } from "react";

function checkCurrentTime() {
  // Always open in dev; enforce hours only in production
  if (import.meta.env.DEV) return true;

  // Puerto Rico is UTC-4 (no DST)
  const now = new Date();
  const prHour   = (now.getUTCHours() - 4 + 24) % 24;
  const prMinute = now.getUTCMinutes();
  const minutes  = prHour * 60 + prMinute;

  // 7:30 AM (450) – 2:30 PM (870)
  return minutes >= 450 && minutes <= 870;
}

export function useSchoolHours() {
  const [isSchoolHours, setIsSchoolHours] = useState(checkCurrentTime);

  useEffect(() => {
    const interval = setInterval(
      () => setIsSchoolHours(checkCurrentTime()),
      60_000
    );
    return () => clearInterval(interval);
  }, []);

  return isSchoolHours;
}
