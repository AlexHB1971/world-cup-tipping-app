"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function clampScore(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(20, Math.floor(n)));
}

type Score = { home: number; away: number };
type Inputs = Record<string, Score>;

function defaultsFor(matches: MatchRow[]): Inputs {
  const out: Inputs = {};
  for (const m of matches) {
    out[m.id] = {
      home: m.prediction?.homeScore ?? 0,
      away: m.prediction?.awayScore ?? 0,
    };
  }
  return out;
}

export function MatchPredictionForm({ matches }: { matches: MatchRow[] }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [inputs, setInputs] = useState<Inputs>(() => defaultsFor(matches));

  // After router.refresh() the matches prop updates with the latest
  // server state. Sync any inputs the user hasn't actively touched, so the
  // form reflects what's saved without overwriting in-progress edits.
  const touchedRef = useRef(touched);
  touchedRef.current = touched;
  useEffect(() => {
    setInputs((prev) => {
      const next = { ...prev };
      for (const m of matches) {
        if (!touchedRef.current.has(m.id)) {
          next[m.id] = {
            home: m.prediction?.homeScore ?? 0,
            away: m.prediction?.awayScore ?? 0,
          };
        }
      }
      return next;
    });
  }, [matches]);

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
      matches: (map.get(stage) ?? []).sort((a, b) => {
        const ka = new Date(a.kickoffAt).getTime();
        const kb = new Date(b.kickoffAt).getTime();
        if (ka !== kb) return ka - kb;
        return (a.matchNumber ?? 0) - (b.matchNumber ?? 0);
      }),
    }));
  }, [matches]);

  const pendingIds = useMemo(() => {
    const ids: string[] = [];
    for (const m of matches) {
      if (!m.isLocked && touched.has(m.id)) ids.push(m.id);
    }
    return ids;
  }, [matches, touched]);

  function setScore(id: string, side: "home" | "away", value: number) {
    setInputs((prev) => ({ ...prev, [id]: { ...prev[id], [side]: value } }));
    setTouched((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  async function postOne(matchId: string, homeScore: number, awayScore: number) {
    const res = await fetch("/api/predictions/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore, awayScore }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, error: data.error as string | undefined };
  }

  async function saveOne(matchId: string) {
    setSavingId(matchId);
    setMessage(null);
    const { home, away } = inputs[matchId];
    const result = await postOne(matchId, home, away);
    setSavingId(null);
    if (!result.ok) {
      setMessage(result.error ?? "Could not save prediction");
      return;
    }
    setMessage("Prediction saved.");
    setTouched((prev) => {
      if (!prev.has(matchId)) return prev;
      const next = new Set(prev);
      next.delete(matchId);
      return next;
    });
    router.refresh();
  }

  async function saveAll() {
    if (pendingIds.length === 0) {
      setMessage("No unsaved changes.");
      return;
    }
    setSavingAll(true);
    setMessage(null);
    const results = await Promise.all(
      pendingIds.map((id) => postOne(id, inputs[id].home, inputs[id].away))
    );
    const okIds = pendingIds.filter((_, i) => results[i].ok);
    const failures = results.filter((r) => !r.ok);
    setSavingAll(false);
    if (failures.length === 0) {
      setMessage(
        `Saved ${okIds.length} prediction${okIds.length === 1 ? "" : "s"}.`
      );
    } else {
      const firstErr = failures.find((f) => f.error)?.error;
      setMessage(
        `Saved ${okIds.length}, ${failures.length} failed${firstErr ? ` (${firstErr})` : ""}.`
      );
    }
    setTouched((prev) => {
      const next = new Set(prev);
      for (const id of okIds) next.delete(id);
      return next;
    });
    router.refresh();
  }

  const messageOk = message
    ? /^Saved|saved\.?$/.test(message) || message.startsWith("Saved ")
    : false;

  return (
    <div>
      <div
        className="card"
        style={{
          position: "sticky",
          top: "0.5rem",
          zIndex: 10,
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div style={{ color: pendingIds.length ? "var(--gold)" : "var(--muted)" }}>
          {pendingIds.length === 0
            ? "No unsaved changes"
            : `${pendingIds.length} unsaved change${pendingIds.length === 1 ? "" : "s"}`}
        </div>
        <button
          className="btn"
          disabled={savingAll || pendingIds.length === 0}
          onClick={saveAll}
        >
          {savingAll ? "Saving…" : "Save all"}
        </button>
      </div>
      {message && (
        <div className={`message ${messageOk ? "success" : "error"}`}>{message}</div>
      )}
      {grouped.map(({ stage, matches: stageMatches }) => (
        <section key={stage} style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "0.75rem" }}>{stage}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {stageMatches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                home={inputs[m.id]?.home ?? 0}
                away={inputs[m.id]?.away ?? 0}
                touched={touched.has(m.id)}
                saving={savingId === m.id}
                onChange={(side, value) => setScore(m.id, side, value)}
                onSave={() => saveOne(m.id)}
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
  home,
  away,
  touched,
  saving,
  onChange,
  onSave,
}: {
  match: MatchRow;
  home: number;
  away: number;
  touched: boolean;
  saving: boolean;
  onChange: (side: "home" | "away", value: number) => void;
  onSave: () => void;
}) {
  const locked = match.isLocked;
  const hasResult = match.homeScore !== null && match.awayScore !== null;
  const saved = match.prediction;

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
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
          onChange={(e) => onChange("home", clampScore(e.target.value))}
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
          onChange={(e) => onChange("away", clampScore(e.target.value))}
          style={{ width: 64 }}
          aria-label={`${match.awayTeam.name} goals`}
        />
        <button
          className="btn"
          disabled={locked || saving || !touched}
          onClick={onSave}
        >
          {locked ? "Locked" : saving ? "Saving…" : "Save"}
        </button>
      </div>
      <div
        style={{
          marginTop: "0.6rem",
          fontSize: "0.85rem",
          color: saved ? "var(--muted)" : "var(--muted)",
        }}
        aria-live="polite"
      >
        {saved
          ? `Saved prediction: ${saved.homeScore} : ${saved.awayScore}`
          : "No prediction saved yet"}
      </div>
    </div>
  );
}
