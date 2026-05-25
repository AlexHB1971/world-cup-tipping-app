import { filterRealTeams } from "@/data/knockout-bracket";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminPanel } from "@/components/AdminPanel";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <div>
        <h2>Admin</h2>
        <AdminLogin />
      </div>
    );
  }

  const [matches, teams, tournamentResult] = await Promise.all([
    prisma.match.findMany({
      orderBy: { kickoffAt: "asc" },
      include: { homeTeam: true, awayTeam: true },
    }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.tournamentResult.findUnique({ where: { id: "singleton" } }),
  ]);

  return (
    <div>
      <h2>Admin</h2>
      <p style={{ color: "var(--muted)" }}>
        Enter actual results to update scores.
      </p>
      <AdminPanel
        matches={matches.map((m) => ({
          id: m.id,
          label: `${m.matchNumber != null ? `[M${m.matchNumber}] ` : ""}${m.homeTeam.name} vs ${m.awayTeam.name}`,
          stage: m.stage,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
        }))}
        teams={filterRealTeams(teams).map((t) => t.name)}
        tournamentResult={tournamentResult}
      />
    </div>
  );
}
