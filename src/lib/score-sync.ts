import { prisma } from "./prisma";
import { fetchWorldCupMatches, isFinished, type FdMatch } from "./football-data";

export type SyncResult = {
  ok: true;
  updated: number;
  unchanged: number;
  unmatched: number;
  apiMatches: number;
  localMatches: number;
};

export type SyncFailure = { ok: false; error: string };

function keyOf(home: string, away: string) {
  return `${home}|${away}`;
}

/**
 * Pull match scores from football-data.org and write them to local DB.
 * Matches are paired by team-name. Knockout matches whose local teams are
 * still bracket placeholders (e.g. "Runner-up Group A") will not match the
 * API yet and are silently skipped — they'll start matching once a future
 * step resolves the bracket.
 */
export async function syncFifaScores(): Promise<SyncResult | SyncFailure> {
  const api = await fetchWorldCupMatches();
  if (!api.ok) return { ok: false, error: api.error };

  const local = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true },
  });

  const apiByPair = new Map<string, FdMatch>();
  for (const m of api.matches) {
    apiByPair.set(keyOf(m.homeTeam.name, m.awayTeam.name), m);
  }

  let updated = 0;
  let unchanged = 0;
  let unmatched = 0;

  for (const m of local) {
    const apiMatch = apiByPair.get(keyOf(m.homeTeam.name, m.awayTeam.name));
    if (!apiMatch) {
      unmatched++;
      continue;
    }

    const apiHome = apiMatch.score.fullTime.home;
    const apiAway = apiMatch.score.fullTime.away;
    if (apiHome == null || apiAway == null) {
      unchanged++;
      continue;
    }

    const shouldLock = isFinished(apiMatch);
    const needsUpdate =
      m.homeScore !== apiHome ||
      m.awayScore !== apiAway ||
      (shouldLock && !m.isLocked);

    if (!needsUpdate) {
      unchanged++;
      continue;
    }

    await prisma.match.update({
      where: { id: m.id },
      data: {
        homeScore: apiHome,
        awayScore: apiAway,
        isLocked: shouldLock || m.isLocked,
      },
    });
    updated++;
  }

  return {
    ok: true,
    updated,
    unchanged,
    unmatched,
    apiMatches: api.matches.length,
    localMatches: local.length,
  };
}
