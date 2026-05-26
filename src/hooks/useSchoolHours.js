// useSchoolHours — returns true while the portal is within school hours.
// School hours are 7:30am–2:30pm (minutes 450–870 since midnight) in PR time.
// In DEMO_MODE it always returns true so developers can test any time of day.
// The hook re-checks every 60 seconds, so the UI responds if the session
// crosses a boundary without a page reload.

import { useState, useEffect } from "react";
import { DEMO_MODE } from "../data/mockData";

export function useSchoolHours() {
  const checkCurrentTime = () => {
    if (DEMO_MODE) return true;
    const now = new Date();
    const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();
    return minutesSinceMidnight >= 450 && minutesSinceMidnight <= 870;
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
