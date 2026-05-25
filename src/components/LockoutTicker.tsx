"use client";

import { useEffect, useState } from "react";
import { PREDICTIONS_LOCK_AT } from "@/lib/world-cup-format";
import { WORLD_CUP_FACTS } from "@/lib/world-cup-facts";

function formatRemaining(msRemaining: number): string {
  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (days > 0) return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

export function LockoutTicker() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const locked = now != null && now >= PREDICTIONS_LOCK_AT;
  const remainingMs = now ? PREDICTIONS_LOCK_AT.getTime() - now.getTime() : 0;

  const factsLine = WORLD_CUP_FACTS.join("  •  ");

  return (
    <div className="ticker" role="status" aria-live="polite">
      <div className={`ticker-left ${locked ? "ticker-locked" : "ticker-countdown"}`}>
        <span aria-hidden>🔒</span>
        {now == null ? (
          <span>Predictions lockout</span>
        ) : locked ? (
          <span>Predictions locked</span>
        ) : (
          <span>
            Predictions lock in{" "}
            <span className="ticker-time">{formatRemaining(remainingMs)}</span>
          </span>
        )}
      </div>
      <div className="ticker-right" aria-label="World Cup facts">
        <div className="ticker-track">
          <span>{factsLine}</span>
          <span aria-hidden>{factsLine}</span>
        </div>
      </div>
    </div>
  );
}
