"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserItem = {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  createdAt: string;
  matchPredictionCount: number;
};

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

function clampScore(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(20, Math.floor(n)));
}

export function AdminPanel({
  currentUserId,
  users,
  matches,
  teams,
  tournamentResult,
}: {
  currentUserId: string;
  users: UserItem[];
  matches: MatchItem[];
  teams: string[];
  tournamentResult: TournamentResult;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  function showResult(ok: boolean, error: string | undefined, success: string) {
    setMessage(ok ? success : error ?? "Action failed");
  }

  async function toggleAdmin(target: UserItem) {
    setBusyUserId(target.id);
    setMessage(null);
    const res = await fetch(`/api/admin/users/${target.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: !target.isAdmin }),
    });
    const data = await res.json().catch(() => ({}));
    setBusyUserId(null);
    showResult(
      res.ok,
      data.error,
      target.isAdmin
        ? `Removed admin from ${target.displayName ?? target.email}.`
        : `Granted admin to ${target.displayName ?? target.email}.`
    );
    if (res.ok) router.refresh();
  }

  async function deleteUser(target: UserItem) {
    const label = target.displayName ?? target.email;
    if (
      !confirm(
        `Delete user "${label}"? This permanently removes their account and all ${target.matchPredictionCount} of their predictions.`
      )
    ) {
      return;
    }
    setBusyUserId(target.id);
    setMessage(null);
    const res = await fetch(`/api/admin/users/${target.id}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    setBusyUserId(null);
    showResult(res.ok, data.error, `Deleted ${label}.`);
    if (res.ok) router.refresh();
  }

  async function saveMatch(matchId: string, homeScore: number, awayScore: number) {
    const res = await fetch("/api/admin/match-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, homeScore, awayScore }),
    });
    const data = await res.json().catch(() => ({}));
    showResult(res.ok, data.error, "Match result saved.");
    if (res.ok) router.refresh();
  }

  async function saveTournament(form: Record<string, string>) {
    const res = await fetch("/api/admin/tournament-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    showResult(res.ok, data.error, "Tournament result saved.");
    if (res.ok) router.refresh();
  }

  const messageOk = message
    ? /(saved|Granted|Removed|Deleted)/.test(message)
    : false;

  return (
    <div>
      {message && (
        <div className={`message ${messageOk ? "success" : "error"}`}>{message}</div>
      )}

      <h3>Users</h3>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Display name</th>
              <th>Email</th>
              <th>Joined</th>
              <th style={{ textAlign: "right" }}>Predictions</th>
              <th>Role</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              const busy = busyUserId === u.id;
              return (
                <tr key={u.id}>
                  <td>
                    {u.displayName ?? <span style={{ color: "var(--muted)" }}>—</span>}
                    {isSelf && (
                      <span className="badge" style={{ marginLeft: "0.5rem" }}>
                        you
                      </span>
                    )}
                  </td>
                  <td style={{ color: "var(--muted)" }}>{u.email}</td>
                  <td style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: "right" }}>{u.matchPredictionCount}</td>
                  <td>
                    {u.isAdmin ? (
                      <span className="badge" style={{ color: "var(--gold)" }}>
                        admin
                      </span>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>user</span>
                    )}
                  </td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <button
                      className="btn secondary"
                      style={{ padding: "0.3rem 0.6rem", marginRight: "0.4rem" }}
                      disabled={busy || (isSelf && u.isAdmin)}
                      title={
                        isSelf && u.isAdmin
                          ? "You can't demote yourself"
                          : undefined
                      }
                      onClick={() => toggleAdmin(u)}
                    >
                      {busy ? "…" : u.isAdmin ? "Remove admin" : "Make admin"}
                    </button>
                    <button
                      className="btn secondary"
                      style={{ padding: "0.3rem 0.6rem", color: "var(--danger)" }}
                      disabled={busy || isSelf}
                      title={isSelf ? "You can't delete yourself" : undefined}
                      onClick={() => deleteUser(u)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: "2rem" }}>Match results</h3>
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
          max={20}
          value={home}
          onChange={(e) => setHome(clampScore(e.target.value))}
          style={{ width: 64 }}
        />
        :
        <input
          type="number"
          min={0}
          max={20}
          value={away}
          onChange={(e) => setAway(clampScore(e.target.value))}
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
