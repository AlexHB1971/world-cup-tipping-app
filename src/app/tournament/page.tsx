import { redirect } from "next/navigation";
import { filterRealTeams } from "@/data/knockout-bracket";
import { TournamentPredictionForm } from "@/components/TournamentPredictionForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TournamentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/register");

  const [teams, prediction, firstMatch] = await Promise.all([
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.tournamentPrediction.findUnique({ where: { userId: user.id } }),
    prisma.match.findFirst({ orderBy: { kickoffAt: "asc" }, select: { kickoffAt: true } }),
  ]);

  const locked = Boolean(firstMatch && firstMatch.kickoffAt <= new Date());

  return (
    <div>
      <h2>Tournament predictions</h2>
      <p style={{ color: "var(--muted)" }}>
        Before the World Cup starts, pick your semi-finalists, finalists, and
        champion.
      </p>
      <TournamentPredictionForm
        teams={filterRealTeams(teams).map((t) => t.name)}
        initial={prediction}
        locked={locked}
      />
    </div>
  );
}
