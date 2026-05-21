/**
 * Official 2026 World Cup knockout bracket (matches 73–104).
 * Round of 32 slots use composite labels for third-placed teams (Annex C combinations).
 * @see https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_knockout_stage
 */

export type BracketFixture = {
  matchNumber: number;
  stage: string;
  homeSlot: string;
  awaySlot: string;
  daysFromNow: number;
};

/** Human-readable names for bracket slot codes stored as Team.code */
export const SLOT_LABELS: Record<string, string> = {
  "1A": "Winner Group A",
  "1B": "Winner Group B",
  "1C": "Winner Group C",
  "1D": "Winner Group D",
  "1E": "Winner Group E",
  "1F": "Winner Group F",
  "1G": "Winner Group G",
  "1H": "Winner Group H",
  "1I": "Winner Group I",
  "1J": "Winner Group J",
  "1K": "Winner Group K",
  "1L": "Winner Group L",
  "2A": "Runner-up Group A",
  "2B": "Runner-up Group B",
  "2C": "Runner-up Group C",
  "2D": "Runner-up Group D",
  "2E": "Runner-up Group E",
  "2F": "Runner-up Group F",
  "2G": "Runner-up Group G",
  "2H": "Runner-up Group H",
  "2I": "Runner-up Group I",
  "2J": "Runner-up Group J",
  "2K": "Runner-up Group K",
  "2L": "Runner-up Group L",
  "3ABCDF": "3rd (A/B/C/D/F)",
  "3BCDFG": "3rd (C/D/F/G/H)",
  "3CEFHI": "3rd (C/E/F/H/I)",
  "3EHIJK": "3rd (E/H/I/J/K)",
  "3BEFIJ": "3rd (B/E/F/I/J)",
  "3AEHIJ": "3rd (A/E/H/I/J)",
  "3EFGIJ": "3rd (E/F/G/I/J)",
  "3DEIJL": "3rd (D/E/I/J/L)",
  "W73": "Winner Match 73",
  "W74": "Winner Match 74",
  "W75": "Winner Match 75",
  "W76": "Winner Match 76",
  "W77": "Winner Match 77",
  "W78": "Winner Match 78",
  "W79": "Winner Match 79",
  "W80": "Winner Match 80",
  "W81": "Winner Match 81",
  "W82": "Winner Match 82",
  "W83": "Winner Match 83",
  "W84": "Winner Match 84",
  "W85": "Winner Match 85",
  "W86": "Winner Match 86",
  "W87": "Winner Match 87",
  "W88": "Winner Match 88",
  "W89": "Winner Match 89",
  "W90": "Winner Match 90",
  "W91": "Winner Match 91",
  "W92": "Winner Match 92",
  "W93": "Winner Match 93",
  "W94": "Winner Match 94",
  "W95": "Winner Match 95",
  "W96": "Winner Match 96",
  "W97": "Winner Match 97",
  "W98": "Winner Match 98",
  "W99": "Winner Match 99",
  "W100": "Winner Match 100",
  "W101": "Winner Match 101",
  "W102": "Winner Match 102",
  "L101": "Loser Match 101",
  "L102": "Loser Match 102",
};

export const KNOCKOUT_FIXTURES: BracketFixture[] = [
  // Round of 32 (16) — June 28 – July 3
  { matchNumber: 73, stage: "Round of 32", homeSlot: "2A", awaySlot: "2B", daysFromNow: 82 },
  { matchNumber: 74, stage: "Round of 32", homeSlot: "1E", awaySlot: "3ABCDF", daysFromNow: 83 },
  { matchNumber: 75, stage: "Round of 32", homeSlot: "1F", awaySlot: "2C", daysFromNow: 83 },
  { matchNumber: 76, stage: "Round of 32", homeSlot: "1C", awaySlot: "2F", daysFromNow: 84 },
  { matchNumber: 77, stage: "Round of 32", homeSlot: "1I", awaySlot: "3BCDFG", daysFromNow: 84 },
  { matchNumber: 78, stage: "Round of 32", homeSlot: "2E", awaySlot: "2I", daysFromNow: 85 },
  { matchNumber: 79, stage: "Round of 32", homeSlot: "1A", awaySlot: "3CEFHI", daysFromNow: 85 },
  { matchNumber: 80, stage: "Round of 32", homeSlot: "1L", awaySlot: "3EHIJK", daysFromNow: 86 },
  { matchNumber: 81, stage: "Round of 32", homeSlot: "1D", awaySlot: "3BEFIJ", daysFromNow: 86 },
  { matchNumber: 82, stage: "Round of 32", homeSlot: "1G", awaySlot: "3AEHIJ", daysFromNow: 87 },
  { matchNumber: 83, stage: "Round of 32", homeSlot: "2K", awaySlot: "2L", daysFromNow: 87 },
  { matchNumber: 84, stage: "Round of 32", homeSlot: "1H", awaySlot: "2J", daysFromNow: 88 },
  { matchNumber: 85, stage: "Round of 32", homeSlot: "1B", awaySlot: "3EFGIJ", daysFromNow: 88 },
  { matchNumber: 86, stage: "Round of 32", homeSlot: "1J", awaySlot: "2H", daysFromNow: 89 },
  { matchNumber: 87, stage: "Round of 32", homeSlot: "1K", awaySlot: "3DEIJL", daysFromNow: 89 },
  { matchNumber: 88, stage: "Round of 32", homeSlot: "2D", awaySlot: "2G", daysFromNow: 90 },
  // Round of 16 (8)
  { matchNumber: 90, stage: "Round of 16", homeSlot: "W73", awaySlot: "W75", daysFromNow: 92 },
  { matchNumber: 89, stage: "Round of 16", homeSlot: "W74", awaySlot: "W77", daysFromNow: 92 },
  { matchNumber: 91, stage: "Round of 16", homeSlot: "W76", awaySlot: "W78", daysFromNow: 93 },
  { matchNumber: 92, stage: "Round of 16", homeSlot: "W79", awaySlot: "W80", daysFromNow: 93 },
  { matchNumber: 93, stage: "Round of 16", homeSlot: "W83", awaySlot: "W84", daysFromNow: 94 },
  { matchNumber: 94, stage: "Round of 16", homeSlot: "W81", awaySlot: "W82", daysFromNow: 94 },
  { matchNumber: 95, stage: "Round of 16", homeSlot: "W86", awaySlot: "W88", daysFromNow: 95 },
  { matchNumber: 96, stage: "Round of 16", homeSlot: "W85", awaySlot: "W87", daysFromNow: 95 },
  // Quarter-finals (4)
  { matchNumber: 97, stage: "Quarter-final", homeSlot: "W89", awaySlot: "W90", daysFromNow: 98 },
  { matchNumber: 98, stage: "Quarter-final", homeSlot: "W93", awaySlot: "W94", daysFromNow: 98 },
  { matchNumber: 99, stage: "Quarter-final", homeSlot: "W91", awaySlot: "W92", daysFromNow: 99 },
  { matchNumber: 100, stage: "Quarter-final", homeSlot: "W95", awaySlot: "W96", daysFromNow: 99 },
  // Semi-finals (2)
  { matchNumber: 101, stage: "Semi-final", homeSlot: "W97", awaySlot: "W98", daysFromNow: 102 },
  { matchNumber: 102, stage: "Semi-final", homeSlot: "W99", awaySlot: "W100", daysFromNow: 103 },
  // Third place & Final
  { matchNumber: 103, stage: "Third-place play-off", homeSlot: "L101", awaySlot: "L102", daysFromNow: 106 },
  { matchNumber: 104, stage: "Final", homeSlot: "W101", awaySlot: "W102", daysFromNow: 107 },
];

export function allBracketSlotCodes(): string[] {
  const codes = new Set<string>();
  for (const f of KNOCKOUT_FIXTURES) {
    codes.add(f.homeSlot);
    codes.add(f.awaySlot);
  }
  return [...codes];
}
