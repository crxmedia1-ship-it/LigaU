"use client";

import { useEffect, useState } from "react";

export function MatchCountdown({
  date,
  live,
}: {
  date: string;
  live?: boolean;
}) {
  const [label, setLabel] = useState(live ? "EN VIVO" : "—");

  useEffect(() => {
    if (live) {
      setLabel("EN VIVO");
      return;
    }

    const tick = () => {
      const diff = +new Date(date) - Date.now();
      if (diff <= 0) {
        setLabel("HOY");
        return;
      }
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      const minutes = Math.floor((diff % 3_600_000) / 60_000);
      setLabel(
        `${String(days).padStart(2, "0")}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`,
      );
    };

    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, [date, live]);

  return (
    <span className="font-mono text-xs tracking-[0.18em] text-zinc-200 uppercase">
      {label}
    </span>
  );
}
