"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KNOCKOUT_STAGES } from "@/lib/world-cup-format";

type MatchRow = {
  id: string;
  stage: string;
  matchNumber: number | null;
  kickoffAt: string;
  homeTeam: { name: string; code: string };
  awayTeam: { name: string; code: string };
  homeScore: number | null;
  awayScore: number | null;
  isLocked: boolean;
  prediction: { homeScore: number; awayScore: number } | null;
};

const STAGE_ORDER = [
  ...Array.from({ length: 12 }, (_, i) => `Group ${String.fromCharCode(65 + i)}`),
  ...KNOCKOUT_STAGES,
];

export function MatchPredictionForm({ matches }: { matches: MatchRow[] }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, MatchRow[]>();
    for (const m of matches) {
      const list = map.get(m.stage) ?? [];
      list.push(m);
      map.set(m.stage, list);
    }
    const stages = [...map.keys()].sort((a, b) => {
      const ia = STAGE_ORDER.indexOf(a);
      const ib = STAGE_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return stages.map((stage) => ({
      stage,
      matches: (map.get(stage) ?? []).sort(
        (a, b) => (a.matchNumber ?? 0) - (b.matchNumber ?? 0)
      ),
    }));
  }, [matches]);

  async function save(matchId: string, homeScore: number, awayScore: number) {
    setSavingId(matchId);
    setMessage(null);
    const res = await fetch("/api/predictions/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore, awayScore }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingId(null);
    if (!res.ok) {
      setMessage(data.error ?? "Could not save prediction");
      return;
    }
    setMessage("Prediction saved.");
    router.refresh();
  }

  return (
    <div>
      {message && (
        <div className={`message ${message.includes("saved") ? "success" : "error"}`}>
          {message}
        </div>
      )}
      {grouped.map(({ stage, matches: stageMatches }) => (
        <section key={stage} style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "0.75rem" }}>{stage}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {stageMatches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                saving={savingId === m.id}
                onSave={save}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MatchCard({
  match,
  saving,
  onSave,
}: {
  match: MatchRow;
  saving: boolean;
  onSave: (id: string, h: number, a: number) => void;
}) {
  const [home, setHome] = useState(match.prediction?.homeScore ?? 0);
  const [away, setAway] = useState(match.prediction?.awayScore ?? 0);
  const locked = match.isLocked;
  const hasResult =
    match.homeScore !== null && match.awayScore !== null;

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          {match.matchNumber != null && (
            <span className="badge" style={{ marginRight: "0.5rem" }}>
              Match {match.matchNumber}
            </span>
          )}
          <div style={{ fontWeight: 700, marginTop: "0.35rem", fontSize: "1.1rem" }}>
            {match.homeTeam.name} vs {match.awayTeam.name}
          </div>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {new Date(match.kickoffAt).toLocaleString()}
          </div>
        </div>
        {hasResult && (
          <div style={{ color: "var(--gold)", fontWeight: 700 }}>
            Result: {match.homeScore}:{match.awayScore}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginTop: "1rem",
          flexWrap: "wrap",
        }}
      >
        <input
          type="number"
          min={0}
          max={20}
          value={home}
          disabled={locked}
          onChange={(e) => setHome(Number(e.target.value))}
          style={{ width: 64 }}
          aria-label={`${match.homeTeam.name} goals`}
        />
        <span>:</span>
        <input
          type="number"
          min={0}
          max={20}
          value={away}
          disabled={locked}
          onChange={(e) => setAway(Number(e.target.value))}
          style={{ width: 64 }}
          aria-label={`${match.awayTeam.name} goals`}
        />
        <button
          className="btn"
          disabled={locked || saving}
          onClick={() => onSave(match.id, home, away)}
        >
          {locked ? "Locked" : saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
