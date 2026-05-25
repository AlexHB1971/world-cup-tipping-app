import Link from "next/link";
import { filterRealTeams } from "@/data/knockout-bracket";
import { AdminPanel } from "@/components/AdminPanel";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div>
        <h2>Admin</h2>
        <p style={{ color: "var(--muted)" }}>
          You need to <Link href="/login">log in</Link> to access the admin
          panel.
        </p>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div>
        <h2>Admin</h2>
        <p style={{ color: "var(--muted)" }}>
          You don&apos;t have admin permissions. Ask an existing admin to grant
          access.
        </p>
      </div>
    );
  }

  const [matches, teams, tournamentResult, users] = await Promise.all([
    prisma.match.findMany({
      orderBy: { kickoffAt: "asc" },
      include: { homeTeam: true, awayTeam: true },
    }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.tournamentResult.findUnique({ where: { id: "singleton" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        displayName: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { matchPredictions: true } },
      },
    }),
  ]);

  return (
    <div>
      <h2>Admin</h2>
      <p style={{ color: "var(--muted)" }}>
        Manage users and record match and tournament results.
      </p>
      <AdminPanel
        currentUserId={user.id}
        users={users.map((u) => ({
          id: u.id,
          email: u.email,
          displayName: u.displayName,
          isAdmin: u.isAdmin,
          createdAt: u.createdAt.toISOString(),
          matchPredictionCount: u._count.matchPredictions,
        }))}
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
