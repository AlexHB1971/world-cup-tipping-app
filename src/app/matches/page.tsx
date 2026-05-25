import { redirect } from "next/navigation";
import { LockoutTicker } from "@/components/LockoutTicker";
import { MatchPredictionForm } from "@/components/MatchPredictionForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { arePredictionsLocked } from "@/lib/world-cup-format";

export default async function MatchesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/register");

  const matches = await prisma.match.findMany({
    orderBy: { kickoffAt: "asc" },
    include: {
      homeTeam: true,
      awayTeam: true,
      predictions: { where: { userId: user.id } },
    },
  });

  const now = new Date();
  const lockedGlobal = arePredictionsLocked(now);

  const rows = matches.map((m) => ({
    id: m.id,
    stage: m.stage,
    matchNumber: m.matchNumber,
    kickoffAt: m.kickoffAt.toISOString(),
    homeTeam: { name: m.homeTeam.name, code: m.homeTeam.code },
    awayTeam: { name: m.awayTeam.name, code: m.awayTeam.code },
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    isLocked: m.isLocked || lockedGlobal || m.kickoffAt <= now,
    prediction: m.predictions[0]
      ? { homeScore: m.predictions[0].homeScore, awayScore: m.predictions[0].awayScore }
      : null,
  }));

  return (
    <div>
      <LockoutTicker />
      <h2>Match predictions</h2>
      <p style={{ color: "var(--muted)" }}>
        Submit scores before the tournament-wide lockout (1 day before kick-off).
      </p>
      <MatchPredictionForm matches={rows} />
    </div>
  );
}
