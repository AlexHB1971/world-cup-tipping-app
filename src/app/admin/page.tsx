import { allBracketSlotCodes } from "@/data/knockout-bracket";
import { AdminPanel } from "@/components/AdminPanel";
import { prisma } from "@/lib/prisma";

const BRACKET_SLOT_CODES = new Set(allBracketSlotCodes());

export default async function AdminPage() {
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
        Enter actual results to update scores. Set{" "}
        <code>ADMIN_SECRET</code> in your environment and use it below.
      </p>
      <AdminPanel
        matches={matches.map((m) => ({
          id: m.id,
          label: `${m.matchNumber != null ? `[M${m.matchNumber}] ` : ""}${m.homeTeam.name} vs ${m.awayTeam.name}`,
          stage: m.stage,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
        }))}
        teams={teams
          .filter((t) => !BRACKET_SLOT_CODES.has(t.code))
          .map((t) => t.name)}
        tournamentResult={tournamentResult}
      />
    </div>
  );
}
