import { computeLeaderboard } from "@/lib/leaderboard";

export default async function LeaderboardPage() {
  const rows = await computeLeaderboard();

  return (
    <div>
      <h2>Leaderboard</h2>
      <p style={{ color: "var(--muted)" }}>
        Combined match and tournament points for all registered users.
      </p>
      <div className="card" style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Match pts</th>
              <th>Tournament pts</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ color: "var(--muted)" }}>
                  No users yet. Be the first to register!
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.userId}>
                  <td>{index + 1}</td>
                  <td>{row.displayName ?? row.email}</td>
                  <td>{row.matchPoints}</td>
                  <td>{row.tournamentPoints}</td>
                  <td style={{ fontWeight: 700, color: "var(--gold)" }}>
                    {row.totalPoints}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
