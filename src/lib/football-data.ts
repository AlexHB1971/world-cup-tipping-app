/**
 * Server-side client for football-data.org v4.
 *
 * Free tier: 10 req/min. We rely on Next.js fetch caching (revalidate: 30s)
 * so a single upstream call serves every visitor within each 30s window.
 */

const ENDPOINT = "https://api.football-data.org/v4/competitions/WC/matches";

export type FdTeam = {
  id: number;
  name: string;
  tla: string | null;
  crest: string | null;
};

export type FdMatch = {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  stage: string;
  group: string | null;
  minute: number | null;
  homeTeam: FdTeam;
  awayTeam: FdTeam;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
};

export type LiveMatchesResult =
  | { ok: true; matches: FdMatch[] }
  | { ok: false; error: string };

export async function fetchWorldCupMatches(): Promise<LiveMatchesResult> {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) {
    return { ok: false, error: "FOOTBALL_DATA_TOKEN not set" };
  }

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      headers: { "X-Auth-Token": token },
      next: { revalidate: 30 },
    });
  } catch (e) {
    return {
      ok: false,
      error: `Network error: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }

  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: "Invalid API token" };
    if (res.status === 429)
      return { ok: false, error: "Rate limited by football-data.org" };
    return { ok: false, error: `football-data.org returned ${res.status}` };
  }

  const data = (await res.json()) as { matches?: FdMatch[] };
  return { ok: true, matches: data.matches ?? [] };
}

const LIVE_STATUSES = new Set([
  "IN_PLAY",
  "PAUSED",
  "EXTRA_TIME",
  "PENALTY_SHOOTOUT",
]);

const FINISHED_STATUSES = new Set(["FINISHED", "AWARDED"]);

const UPCOMING_STATUSES = new Set(["TIMED", "SCHEDULED"]);

export function isLive(m: FdMatch) {
  return LIVE_STATUSES.has(m.status);
}

export function isFinished(m: FdMatch) {
  return FINISHED_STATUSES.has(m.status);
}

export function isUpcoming(m: FdMatch) {
  return UPCOMING_STATUSES.has(m.status);
}

/**
 * Order: live first, then upcoming (soonest first), then finished
 * (most recent first). Returns at most `limit` matches.
 */
export function pickRelevant(matches: FdMatch[], limit = 6): FdMatch[] {
  const live = matches.filter(isLive);
  const upcoming = matches
    .filter(isUpcoming)
    .sort(
      (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
    );
  const finished = matches
    .filter(isFinished)
    .sort(
      (a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime()
    );
  return [...live, ...upcoming, ...finished].slice(0, limit);
}

export function prettyStage(stage: string): string {
  return stage
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
