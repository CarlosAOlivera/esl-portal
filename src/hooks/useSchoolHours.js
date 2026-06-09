// useSchoolHours — returns true while the portal is within school hours.
// School hours are 7:30am–2:30pm (minutes 450–870 since midnight) in PR time.
// In development (Vite DEV mode) it always returns true so you can test any time.
// The hook re-checks every 60 seconds, so the UI responds if the session
// crosses a boundary without a page reload.

import { useState, useEffect } from "react";

export function useSchoolHours() {
  const checkCurrentTime = () => {
    // TODO: re-enable time gating before August 2026 go-live
    // if (import.meta.env.DEV) return true;
    // const now = new Date();
    // const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
    // return minutesSinceMidnight >= 450 && minutesSinceMidnight <= 870;
    return true; // temporarily disabled for testing
  };

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
