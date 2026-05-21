import { redirect } from "next/navigation";
import { allBracketSlotCodes } from "@/data/knockout-bracket";
import { TournamentPredictionForm } from "@/components/TournamentPredictionForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BRACKET_SLOT_CODES = new Set(allBracketSlotCodes());

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
        teams={teams
          .filter((t) => !BRACKET_SLOT_CODES.has(t.code))
          .map((t) => t.name)}
        initial={prediction}
        locked={locked}
      />
    </div>
  );
}
