/**
 * FIFA World Cup 2026 group & knockout format.
 * @see https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/groups-how-teams-qualify-tie-breakers
 */

/** Opening match of the 2026 FIFA World Cup (kept in sync with prisma/seed.ts). */
export const TOURNAMENT_START = new Date("2026-06-11T18:00:00Z");

/** All predictions (match + tournament) lock 24 hours before the opening match. */
export const PREDICTIONS_LOCK_AT = new Date(
  TOURNAMENT_START.getTime() - 24 * 60 * 60 * 1000
);

export function arePredictionsLocked(now: Date = new Date()): boolean {
  return now >= PREDICTIONS_LOCK_AT;
}

export const GROUP_POINTS = { win: 3, draw: 1, loss: 0 } as const;

/** Order for separating teams on equal points (FIFA group stage). */
export const GROUP_TIE_BREAKERS = [
  "Points in all group matches",
  "Goal difference in all group matches",
  "Goals scored in all group matches",
  "Fair play points (disciplinary record)",
  "FIFA World Ranking",
] as const;

/** When 2+ teams are tied on points, head-to-head mini-table is applied first. */
export const HEAD_TO_HEAD_TIE_BREAKERS = [
  "Points in matches between tied teams",
  "Goal difference in matches between tied teams",
  "Goals scored in matches between tied teams",
] as const;

export const KNOCKOUT_QUALIFICATION = {
  perGroupTopTwo: 2,
  groups: 12,
  autoQualified: 24,
  bestThirdPlaces: 8,
  knockoutTeams: 32,
} as const;

export const KNOCKOUT_STAGES = [
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Third-place play-off",
  "Final",
] as const;

export type GroupResult = {
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  fairPlayPoints: number;
  fifaRanking: number;
};

export function goalDifference(r: Pick<GroupResult, "goalsFor" | "goalsAgainst">) {
  return r.goalsFor - r.goalsAgainst;
}

/** Sort by FIFA group tie-breakers (simplified: no live fair-play/ranking data in predictions). */
export function compareGroupStandings(a: GroupResult, b: GroupResult): number {
  if (b.points !== a.points) return b.points - a.points;
  const gdA = goalDifference(a);
  const gdB = goalDifference(b);
  if (gdB !== gdA) return gdB - gdA;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  if (b.fairPlayPoints !== a.fairPlayPoints) return b.fairPlayPoints - a.fairPlayPoints;
  return a.fifaRanking - b.fifaRanking;
}

export function rankThirdPlaceTeams(
  thirdPlaceSides: GroupResult[]
): GroupResult[] {
  return [...thirdPlaceSides].sort(compareGroupStandings);
}
