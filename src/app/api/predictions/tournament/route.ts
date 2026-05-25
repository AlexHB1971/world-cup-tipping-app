import { NextResponse } from "next/server";
import { filterRealTeams } from "@/data/knockout-bracket";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FIELDS = [
  "semiFinalist1",
  "semiFinalist2",
  "semiFinalist3",
  "semiFinalist4",
  "finalist1",
  "finalist2",
  "winner",
] as const;

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const firstMatch = await prisma.match.findFirst({
    orderBy: { kickoffAt: "asc" },
    select: { kickoffAt: true },
  });
  if (firstMatch && firstMatch.kickoffAt <= new Date()) {
    return NextResponse.json(
      { error: "Tournament predictions are locked — the World Cup has started" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const data = {} as Record<(typeof FIELDS)[number], string>;
  for (const field of FIELDS) {
    const value = String(body[field] ?? "").trim();
    if (!value) {
      return NextResponse.json({ error: `Missing ${field}` }, { status: 400 });
    }
    data[field] = value;
  }

  const teams = new Set(
    filterRealTeams(
      await prisma.team.findMany({ select: { name: true, code: true } })
    ).map((t) => t.name)
  );
  for (const value of Object.values(data)) {
    if (!teams.has(value)) {
      return NextResponse.json({ error: `Unknown team: ${value}` }, { status: 400 });
    }
  }

  const semiSet = new Set([
    data.semiFinalist1,
    data.semiFinalist2,
    data.semiFinalist3,
    data.semiFinalist4,
  ]);
  if (semiSet.size < 4) {
    return NextResponse.json(
      { error: "Pick four different semi-finalists" },
      { status: 400 }
    );
  }

  const finalistSet = new Set([data.finalist1, data.finalist2]);
  if (finalistSet.size < 2) {
    return NextResponse.json(
      { error: "Pick two different finalists" },
      { status: 400 }
    );
  }

  if (!semiSet.has(data.finalist1) || !semiSet.has(data.finalist2)) {
    return NextResponse.json(
      { error: "Finalists must be chosen from your semi-finalists" },
      { status: 400 }
    );
  }
  if (!finalistSet.has(data.winner)) {
    return NextResponse.json(
      { error: "Winner must be one of your finalists" },
      { status: 400 }
    );
  }

  await prisma.tournamentPrediction.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return NextResponse.json({ ok: true });
}
