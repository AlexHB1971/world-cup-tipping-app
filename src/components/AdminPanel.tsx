"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type MatchItem = {
  id: string;
  label: string;
  stage: string;
  homeScore: number | null;
  awayScore: number | null;
};

type TournamentResult = {
  semiFinalist1: string | null;
  semiFinalist2: string | null;
  semiFinalist3: string | null;
  semiFinalist4: string | null;
  finalist1: string | null;
  finalist2: string | null;
  winner: string | null;
} | null;

export function AdminPanel({
  matches,
  teams,
  tournamentResult,
}: {
  matches: MatchItem[];
  teams: string[];
  tournamentResult: TournamentResult;
}) {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function saveMatch(matchId: string, homeScore: number, awayScore: number) {
    const res = await fetch("/api/admin/match-result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": secret,
      },
      body: JSON.stringify({ matchId, homeScore, awayScore }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error ?? "Failed to save match");
      return;
    }
    setMessage("Match result saved.");
    router.refresh();
  }

  async function saveTournament(form: Record<string, string>) {
    const res = await fetch("/api/admin/tournament-result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-secret": secret,
      },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error ?? "Failed to save tournament");
      return;
    }
    setMessage("Tournament result saved.");
    router.refresh();
  }

  return (
    <div>
      <div className="card field">
        <label>Admin secret</label>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="ADMIN_SECRET from .env"
        />
      </div>
      {message && (
        <div className={`message ${message.includes("saved") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      <h3>Match results</h3>
      {matches.map((m) => (
        <MatchResultRow key={m.id} match={m} onSave={saveMatch} />
      ))}

      <h3 style={{ marginTop: "2rem" }}>Tournament results</h3>
      <TournamentResultForm
        teams={teams}
        initial={tournamentResult}
        onSave={saveTournament}
      />
    </div>
  );
}

function MatchResultRow({
  match,
  onSave,
}: {
  match: MatchItem;
  onSave: (id: string, h: number, a: number) => void;
}) {
  const [home, setHome] = useState(match.homeScore ?? 0);
  const [away, setAway] = useState(match.awayScore ?? 0);

  return (
    <div className="card" style={{ marginBottom: "0.75rem" }}>
      <div className="badge">{match.stage}</div>
      <div style={{ fontWeight: 600, margin: "0.5rem 0" }}>{match.label}</div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          type="number"
          min={0}
          value={home}
          onChange={(e) => setHome(Number(e.target.value))}
          style={{ width: 64 }}
        />
        :
        <input
          type="number"
          min={0}
          value={away}
          onChange={(e) => setAway(Number(e.target.value))}
          style={{ width: 64 }}
        />
        <button className="btn secondary" onClick={() => onSave(match.id, home, away)}>
          Set result
        </button>
      </div>
    </div>
  );
}

function TournamentResultForm({
  teams,
  initial,
  onSave,
}: {
  teams: string[];
  initial: TournamentResult;
  onSave: (data: Record<string, string>) => void;
}) {
  const [form, setForm] = useState({
    semiFinalist1: initial?.semiFinalist1 ?? "",
    semiFinalist2: initial?.semiFinalist2 ?? "",
    semiFinalist3: initial?.semiFinalist3 ?? "",
    semiFinalist4: initial?.semiFinalist4 ?? "",
    finalist1: initial?.finalist1 ?? "",
    finalist2: initial?.finalist2 ?? "",
    winner: initial?.winner ?? "",
  });

  const fields = [
    ["semiFinalist1", "Semi 1"],
    ["semiFinalist2", "Semi 2"],
    ["semiFinalist3", "Semi 3"],
    ["semiFinalist4", "Semi 4"],
    ["finalist1", "Finalist 1"],
    ["finalist2", "Finalist 2"],
    ["winner", "Winner"],
  ] as const;

  return (
    <div className="card grid-2">
      {fields.map(([key, label]) => (
        <div className="field" key={key}>
          <label>{label}</label>
          <select
            value={form[key]}
            onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          >
            <option value="">—</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      ))}
      <div style={{ gridColumn: "1 / -1" }}>
        <button className="btn" onClick={() => onSave(form)}>
          Save tournament results
        </button>
      </div>
    </div>
  );
}
