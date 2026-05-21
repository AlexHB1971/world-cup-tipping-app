import Link from "next/link";
import {
  GROUP_POINTS,
  GROUP_TIE_BREAKERS,
  HEAD_TO_HEAD_TIE_BREAKERS,
  KNOCKOUT_QUALIFICATION,
  KNOCKOUT_STAGES,
} from "@/lib/world-cup-format";

export default function FormatPage() {
  return (
    <div>
      <h2>Tournament format</h2>
      <p style={{ color: "var(--muted)" }}>
        Based on the official FIFA World Cup 2026 rules for groups, qualification,
        and tie-breakers.
      </p>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Group stage (48 teams)</h3>
        <ul style={{ lineHeight: 1.7, color: "var(--muted)" }}>
          <li>12 groups of 4 teams — each team plays 3 matches.</li>
          <li>
            <strong style={{ color: "var(--text)" }}>{GROUP_POINTS.win} points</strong>{" "}
            for a win, <strong style={{ color: "var(--text)" }}>{GROUP_POINTS.draw}</strong>{" "}
            for a draw, <strong style={{ color: "var(--text)" }}>{GROUP_POINTS.loss}</strong>{" "}
            for a loss.
          </li>
          <li>No extra time or penalties in the group stage.</li>
        </ul>
      </section>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Who advances to the knockout stage?</h3>
        <ul style={{ lineHeight: 1.7, color: "var(--muted)" }}>
          <li>
            Top <strong style={{ color: "var(--text)" }}>{KNOCKOUT_QUALIFICATION.perGroupTopTwo}</strong>{" "}
            from each group → {KNOCKOUT_QUALIFICATION.autoQualified} teams.
          </li>
          <li>
            Best <strong style={{ color: "var(--text)" }}>{KNOCKOUT_QUALIFICATION.bestThirdPlaces}</strong>{" "}
            third-placed teams (ranked across all groups).
          </li>
          <li>
            Total: <strong style={{ color: "var(--text)" }}>{KNOCKOUT_QUALIFICATION.knockoutTeams}</strong>{" "}
            teams in the knockout stage.
          </li>
        </ul>
        <p className="score-hint">
          Third-place teams are ranked on the same criteria as group standings.
          Which third-placed team fills each Round of 32 slot depends on the
          combination of groups that qualify — FIFA published 495 possible
          bracket setups (Annex C).
        </p>
      </section>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Tie-breakers (equal points)</h3>
        <p style={{ color: "var(--muted)" }}>
          If two or more teams are level on points, FIFA applies:
        </p>
        <ol style={{ lineHeight: 1.7, color: "var(--muted)" }}>
          {HEAD_TO_HEAD_TIE_BREAKERS.map((rule) => (
            <li key={rule}>
              <strong style={{ color: "var(--text)" }}>Head-to-head:</strong> {rule}
            </li>
          ))}
          {GROUP_TIE_BREAKERS.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ol>
      </section>

      <section className="card" style={{ marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Knockout stage</h3>
        <p style={{ color: "var(--muted)" }}>
          Single elimination from the Round of 32 through the Final. Tied matches
          go to extra time, then penalties if still level.
        </p>
        <ol style={{ lineHeight: 1.7, color: "var(--muted)" }}>
          {KNOCKOUT_STAGES.map((stage) => (
            <li key={stage}>{stage}</li>
          ))}
        </ol>
        <p className="score-hint">
          Round of 32 pairings use fixed bracket slots (group winners, runners-up,
          and composite third-place slots). Later rounds use winners of prior
          matches (e.g. Winner Match 73).
        </p>
      </section>

      <p>
        <Link href="/matches">Predict matches →</Link>
      </p>
    </div>
  );
}
