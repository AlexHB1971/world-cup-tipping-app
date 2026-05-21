import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="grid-2">
      <section className="card">
        <h2 style={{ marginTop: 0 }}>How scoring works</h2>
        <ul style={{ lineHeight: 1.7, color: "var(--muted)" }}>
          <li>
            <strong style={{ color: "var(--text)" }}>5 points</strong> — exact
            score (e.g. predict 3:2, result 3:2)
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>2 points</strong> — correct
            goal difference (e.g. predict 3:2, result 2:1; both +1)
          </li>
          <li>
            <strong style={{ color: "var(--text)" }}>1 point</strong> — correct
            winner or draw
          </li>
        </ul>
        <p className="score-hint">You receive the highest tier that applies, not a sum.</p>
      </section>
      <section className="card">
        <h2 style={{ marginTop: 0 }}>Get started</h2>
        {user ? (
          <>
            <p>Logged in as {user.displayName ?? user.email}.</p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link className="btn" href="/matches">
                Predict matches
              </Link>
              <Link className="btn secondary" href="/tournament">
                Tournament picks
              </Link>
            </div>
          </>
        ) : (
          <>
            <p>Register with your email to save predictions and appear on the leaderboard.</p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link className="btn" href="/register">
                Register
              </Link>
              <Link className="btn secondary" href="/login">
                Log in
              </Link>
            </div>
          </>
        )}
        <p style={{ marginTop: "1.25rem" }}>
          <Link href="/format">How groups & knockout qualification work →</Link>
          <br />
          <Link href="/leaderboard">View leaderboard →</Link>
        </p>
      </section>
    </div>
  );
}
