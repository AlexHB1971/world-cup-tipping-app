import { prisma } from "./prisma";
import { scoreMatchPrediction, scoreTournamentPrediction } from "./scoring";

export type LeaderboardRow = {
  userId: string;
  email: string;
  displayName: string | null;
  matchPoints: number;
  tournamentPoints: number;
  totalPoints: number;
};

export async function computeLeaderboard(): Promise<LeaderboardRow[]> {
  const [users, matches, tournamentResult] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        matchPredictions: true,
        tournamentPrediction: true,
      },
    }),
    prisma.match.findMany({
      where: {
        homeScore: { not: null },
        awayScore: { not: null },
      },
      select: { id: true, homeScore: true, awayScore: true },
    }),
    prisma.tournamentResult.findUnique({ where: { id: "singleton" } }),
  ]);

  const finishedMatches = matches.filter(
    (m) => m.homeScore !== null && m.awayScore !== null
  );

  const rows: LeaderboardRow[] = users.map((user) => {
    let matchPoints = 0;
    for (const match of finishedMatches) {
      const pred = user.matchPredictions.find((p) => p.matchId === match.id);
      if (!pred) continue;
      matchPoints += scoreMatchPrediction(
        pred.homeScore,
        pred.awayScore,
        match.homeScore!,
        match.awayScore!
      );
    }

    let tournamentPoints = 0;
    if (user.tournamentPrediction && tournamentResult?.winner) {
      tournamentPoints = scoreTournamentPrediction(
        user.tournamentPrediction,
        tournamentResult
      ).points;
    }

    return {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      matchPoints,
      tournamentPoints,
      totalPoints: matchPoints + tournamentPoints,
    };
  });

  return rows.sort((a, b) => b.totalPoints - a.totalPoints);
}
