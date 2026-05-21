export type ScoreBreakdown = {
  matchPoints: number;
  tournamentPoints: number;
  total: number;
  perMatch: { matchId: string; points: number }[];
  tournament: {
    semiCorrect: number;
    finalistCorrect: number;
    winnerCorrect: boolean;
    points: number;
  };
};

export function getMatchOutcome(home: number, away: number): "home" | "away" | "draw" {
  if (home > away) return "home";
  if (away > home) return "away";
  return "draw";
}

/** Best single tier: 5 exact, else 2 goal diff, else 1 winner. */
export function scoreMatchPrediction(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): number {
  if (predictedHome === actualHome && predictedAway === actualAway) return 5;

  const predDiff = predictedHome - predictedAway;
  const actualDiff = actualHome - actualAway;
  if (predDiff === actualDiff) return 2;

  const predOutcome = getMatchOutcome(predictedHome, predictedAway);
  const actualOutcome = getMatchOutcome(actualHome, actualAway);
  if (predOutcome === actualOutcome) return 1;

  return 0;
}

const TOURNAMENT_POINTS = {
  semiFinalist: 3,
  finalist: 5,
  winner: 10,
} as const;

export function scoreTournamentPrediction(
  prediction: {
    semiFinalist1: string;
    semiFinalist2: string;
    semiFinalist3: string;
    semiFinalist4: string;
    finalist1: string;
    finalist2: string;
    winner: string;
  },
  result: {
    semiFinalist1: string | null;
    semiFinalist2: string | null;
    semiFinalist3: string | null;
    semiFinalist4: string | null;
    finalist1: string | null;
    finalist2: string | null;
    winner: string | null;
  } | null
): ScoreBreakdown["tournament"] {
  const empty = {
    semiCorrect: 0,
    finalistCorrect: 0,
    winnerCorrect: false,
    points: 0,
  };
  if (!result?.winner) return empty;

  const actualSemis = new Set(
    [
      result.semiFinalist1,
      result.semiFinalist2,
      result.semiFinalist3,
      result.semiFinalist4,
    ].filter(Boolean) as string[]
  );
  const predictedSemis = [
    prediction.semiFinalist1,
    prediction.semiFinalist2,
    prediction.semiFinalist3,
    prediction.semiFinalist4,
  ];
  const semiCorrect = predictedSemis.filter((t) => actualSemis.has(t)).length;

  const actualFinalists = new Set(
    [result.finalist1, result.finalist2].filter(Boolean) as string[]
  );
  const predictedFinalists = [prediction.finalist1, prediction.finalist2];
  const finalistCorrect = predictedFinalists.filter((t) =>
    actualFinalists.has(t)
  ).length;

  const winnerCorrect = prediction.winner === result.winner;

  const points =
    semiCorrect * TOURNAMENT_POINTS.semiFinalist +
    finalistCorrect * TOURNAMENT_POINTS.finalist +
    (winnerCorrect ? TOURNAMENT_POINTS.winner : 0);

  return { semiCorrect, finalistCorrect, winnerCorrect, points };
}
