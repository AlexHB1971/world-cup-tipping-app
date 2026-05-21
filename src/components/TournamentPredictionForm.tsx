"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  teams: string[];
  initial: {
    semiFinalist1: string;
    semiFinalist2: string;
    semiFinalist3: string;
    semiFinalist4: string;
    finalist1: string;
    finalist2: string;
    winner: string;
  } | null;
  locked: boolean;
};

export function TournamentPredictionForm({ teams, initial, locked }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    semiFinalist1: initial?.semiFinalist1 ?? "",
    semiFinalist2: initial?.semiFinalist2 ?? "",
    semiFinalist3: initial?.semiFinalist3 ?? "",
    semiFinalist4: initial?.semiFinalist4 ?? "",
    finalist1: initial?.finalist1 ?? "",
    finalist2: initial?.finalist2 ?? "",
    winner: initial?.winner ?? "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/predictions/tournament", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error ?? "Could not save");
      return;
    }
    setMessage("Tournament prediction saved.");
    router.refresh();
  }

  const semiFields = [
    ["semiFinalist1", "Semi-finalist 1"],
    ["semiFinalist2", "Semi-finalist 2"],
    ["semiFinalist3", "Semi-finalist 3"],
    ["semiFinalist4", "Semi-finalist 4"],
  ] as const;

  return (
    <form className="card" onSubmit={onSubmit}>
      <p className="score-hint">
        Pick before kickoff: 4 semi-finalists (3 pts each), 2 finalists (5 pts
        each), winner (10 pts). Submit once — edits allowed until tournament
        lock.
      </p>
      <h3 style={{ marginTop: 0 }}>Semi-finalists</h3>
      <div className="grid-2">
        {semiFields.map(([key, label]) => (
          <div className="field" key={key}>
            <label>{label}</label>
            <select
              required
              disabled={locked}
              value={form[key]}
              onChange={(e) => setField(key, e.target.value)}
            >
              <option value="">Select team</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <h3>Finalists</h3>
      <div className="grid-2">
        {(
          [
            ["finalist1", "Finalist 1"],
            ["finalist2", "Finalist 2"],
          ] as const
        ).map(
          ([key, label]) => (
            <div className="field" key={key}>
              <label>{label}</label>
              <select
                required
                disabled={locked}
                value={form[key]}
                onChange={(e) => setField(key, e.target.value)}
              >
                <option value="">Select team</option>
                {teams.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )
        )}
      </div>
      <h3>Winner</h3>
      <div className="field">
        <label>World Cup champion</label>
        <select
          required
          disabled={locked}
          value={form.winner}
          onChange={(e) => setField("winner", e.target.value)}
        >
          <option value="">Select team</option>
          {teams.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      {message && (
        <div className={`message ${message.includes("saved") ? "success" : "error"}`}>
          {message}
        </div>
      )}
      <button className="btn" type="submit" disabled={locked || loading}>
        {locked ? "Tournament predictions locked" : loading ? "Saving…" : "Save tournament picks"}
      </button>
    </form>
  );
}
