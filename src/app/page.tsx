import Link from "next/link";
import { LiveRefresher } from "@/components/LiveRefresher";
import { getCurrentUser } from "@/lib/auth";
import { computeLeaderboard } from "@/lib/leaderboard";
import { prisma } from "@/lib/prisma";

function relativeTime(date: Date, now: Date): string {
  const diffMs = date.getTime() - now.getTime();
  const future = diffMs >= 0;
  const abs = Math.abs(diffMs);
  const mins = Math.floor(abs / 60_000);
  if (mins < 1) return future ? "any moment" : "just now";
  if (mins < 60) return future ? `in ${mins}m` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return future ? `in ${hours}h` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return future ? `in ${days}d` : `${days}d ago`;
}

export default async function HomePage() {
  const now = new Date();
  const [user, upcoming, recentResults, leaderboard] = await Promise.all([
    getCurrentUser(),
    prisma.match.findMany({
      where: { kickoffAt: { gte: now } },
      orderBy: { kickoffAt: "asc" },
      take: 3,
      include: { homeTeam: true, awayTeam: true },
    }),
    prisma.match.findMany({
      where: { homeScore: { not: null }, awayScore: { not: null } },
      orderBy: { kickoffAt: "desc" },
      take: 3,
      include: { homeTeam: true, awayTeam: true },
    }),
    computeLeaderboard(),
  ]);
  const topFive = leaderboard.slice(0, 5);

  return (
    <>
      <LiveRefresher />
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

      <h2 style={{ marginTop: "2rem" }}>
        Live
        <span className="badge" style={{ marginLeft: "0.5rem", verticalAlign: "middle" }}>
          updates every 30s
        </span>
      </h2>
      <div className="grid-2" style={{ marginTop: "0.5rem" }}>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>Up next</h3>
          {upcoming.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No upcoming fixtures.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {upcoming.map((m) => (
                <li
                  key={m.id}
                  style={{
                    padding: "0.6rem 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                    <div>
                      <span className="badge" style={{ marginRight: "0.4rem" }}>{m.stage}</span>
                      <strong>{m.homeTeam.name}</strong> vs <strong>{m.awayTeam.name}</strong>
                    </div>
                    <div style={{ color: "var(--gold)", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {relativeTime(m.kickoffAt, now)}
                    </div>
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: "0.15rem" }}>
                    {m.kickoffAt.toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h3 style={{ marginTop: 0 }}>Latest results</h3>
          {recentResults.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>
              No results yet. The tournament starts 11 June 2026.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recentResults.map((m) => (
                <li
                  key={m.id}
                  style={{
                    padding: "0.6rem 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                    <div>
                      <span className="badge" style={{ marginRight: "0.4rem" }}>{m.stage}</span>
                      <strong>{m.homeTeam.name}</strong> vs <strong>{m.awayTeam.name}</strong>
                    </div>
                    <div style={{ color: "var(--accent)", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {m.homeScore}:{m.awayScore}
                    </div>
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: "0.15rem" }}>
                    {relativeTime(m.kickoffAt, now)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Top of the table</h3>
        {topFive.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No users yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th style={{ textAlign: "right" }}>Match</th>
                <th style={{ textAlign: "right" }}>Tournament</th>
                <th style={{ textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {topFive.map((row, i) => (
                <tr key={row.userId}>
                  <td>{i + 1}</td>
                  <td>{row.displayName ?? row.email}</td>
                  <td style={{ textAlign: "right" }}>{row.matchPoints}</td>
                  <td style={{ textAlign: "right" }}>{row.tournamentPoints}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "var(--gold)" }}>
                    {row.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style={{ marginTop: "0.75rem" }}>
          <Link href="/leaderboard">See full leaderboard →</Link>
        </p>
      </section>
    </>
  );
}
