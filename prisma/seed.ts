import { PrismaClient } from "@prisma/client";
import {
  KNOCKOUT_FIXTURES,
  SLOT_LABELS,
  allBracketSlotCodes,
} from "../src/data/knockout-bracket";

const prisma = new PrismaClient();

/** Official FIFA World Cup 2026 groups (48 teams). */
const GROUPS: Record<string, { name: string; code: string }[]> = {
  A: [
    { name: "Mexico", code: "MEX" },
    { name: "South Korea", code: "KOR" },
    { name: "South Africa", code: "RSA" },
    { name: "Czechia", code: "CZE" },
  ],
  B: [
    { name: "Canada", code: "CAN" },
    { name: "Switzerland", code: "SUI" },
    { name: "Qatar", code: "QAT" },
    { name: "Bosnia & Herzegovina", code: "BIH" },
  ],
  C: [
    { name: "Brazil", code: "BRA" },
    { name: "Morocco", code: "MAR" },
    { name: "Scotland", code: "SCO" },
    { name: "Haiti", code: "HAI" },
  ],
  D: [
    { name: "United States", code: "USA" },
    { name: "Paraguay", code: "PAR" },
    { name: "Australia", code: "AUS" },
    { name: "Türkiye", code: "TUR" },
  ],
  E: [
    { name: "Germany", code: "GER" },
    { name: "Ecuador", code: "ECU" },
    { name: "Ivory Coast", code: "CIV" },
    { name: "Curaçao", code: "CUW" },
  ],
  F: [
    { name: "Netherlands", code: "NED" },
    { name: "Japan", code: "JPN" },
    { name: "Tunisia", code: "TUN" },
    { name: "Sweden", code: "SWE" },
  ],
  G: [
    { name: "Belgium", code: "BEL" },
    { name: "Iran", code: "IRN" },
    { name: "Egypt", code: "EGY" },
    { name: "New Zealand", code: "NZL" },
  ],
  H: [
    { name: "Spain", code: "ESP" },
    { name: "Uruguay", code: "URU" },
    { name: "Saudi Arabia", code: "KSA" },
    { name: "Cape Verde", code: "CPV" },
  ],
  I: [
    { name: "France", code: "FRA" },
    { name: "Senegal", code: "SEN" },
    { name: "Norway", code: "NOR" },
    { name: "Iraq", code: "IRQ" },
  ],
  J: [
    { name: "Argentina", code: "ARG" },
    { name: "Austria", code: "AUT" },
    { name: "Algeria", code: "ALG" },
    { name: "Jordan", code: "JOR" },
  ],
  K: [
    { name: "Portugal", code: "POR" },
    { name: "Colombia", code: "COL" },
    { name: "Uzbekistan", code: "UZB" },
    { name: "DR Congo", code: "COD" },
  ],
  L: [
    { name: "England", code: "ENG" },
    { name: "Croatia", code: "CRO" },
    { name: "Ghana", code: "GHA" },
    { name: "Panama", code: "PAN" },
  ],
};

/** Opening match of the 2026 World Cup. All fixtures are offsets from this date. */
const TOURNAMENT_START = new Date("2026-06-11T18:00:00Z");

function daysAfterStart(days: number, hourUTC: number): Date {
  const d = new Date(TOURNAMENT_START);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hourUTC, 0, 0, 0);
  return d;
}

type Fixture = {
  home: string;
  away: string;
  stage: string;
  daysFromStart: number;
};

function groupRoundRobinFixtures(
  groupLetter: string,
  teams: { name: string }[],
  baseDaysFromStart: number
): Fixture[] {
  const fixtures: Fixture[] = [];
  let offset = 0;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      fixtures.push({
        home: teams[i].name,
        away: teams[j].name,
        stage: `Group ${groupLetter}`,
        daysFromStart: baseDaysFromStart + offset,
      });
      offset += 1;
    }
  }
  return fixtures;
}

function buildGroupFixtures(): Fixture[] {
  const fixtures: Fixture[] = [];
  const letters = Object.keys(GROUPS).sort();
  letters.forEach((letter, groupIndex) => {
    fixtures.push(
      ...groupRoundRobinFixtures(letter, GROUPS[letter], groupIndex)
    );
  });
  return fixtures;
}

async function seedBracketSlotTeams() {
  for (const code of allBracketSlotCodes()) {
    const name = SLOT_LABELS[code];
    if (!name) continue;
    await prisma.team.upsert({
      where: { code },
      create: { code, name },
      update: { name },
    });
  }
}

async function main() {
  const allTeams = Object.values(GROUPS).flat();
  for (const team of allTeams) {
    await prisma.team.upsert({
      where: { code: team.code },
      create: team,
      update: { name: team.name },
    });
  }

  await seedBracketSlotTeams();

  const teamByCode = Object.fromEntries(
    (await prisma.team.findMany()).map((t) => [t.code, t.id])
  );

  await prisma.match.deleteMany();

  const groupFixtures = buildGroupFixtures();
  for (const f of groupFixtures) {
    const home = allTeams.find((t) => t.name === f.home);
    const away = allTeams.find((t) => t.name === f.away);
    if (!home || !away) continue;
    await prisma.match.create({
      data: {
        homeTeamId: teamByCode[home.code],
        awayTeamId: teamByCode[away.code],
        stage: f.stage,
        kickoffAt: daysAfterStart(f.daysFromStart, 18),
      },
    });
  }

  for (const f of KNOCKOUT_FIXTURES) {
    const homeId = teamByCode[f.homeSlot];
    const awayId = teamByCode[f.awaySlot];
    if (!homeId || !awayId) {
      console.warn(`Skipping M${f.matchNumber}: missing slot team`);
      continue;
    }
    await prisma.match.create({
      data: {
        matchNumber: f.matchNumber,
        homeTeamId: homeId,
        awayTeamId: awayId,
        stage: f.stage,
        kickoffAt: daysAfterStart(f.daysFromStart, 20),
      },
    });
  }

  await prisma.tournamentResult.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });

  console.log(
    `Seed complete: ${allTeams.length} nations, ${allBracketSlotCodes().length} bracket slots, ` +
      `${groupFixtures.length} group + ${KNOCKOUT_FIXTURES.length} knockout matches (${groupFixtures.length + KNOCKOUT_FIXTURES.length} total).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
