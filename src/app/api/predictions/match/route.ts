import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const matchId = String(body.matchId ?? "");
  const homeScore = Number(body.homeScore);
  const awayScore = Number(body.awayScore);

  if (!matchId || Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
    return NextResponse.json({ error: "Invalid prediction" }, { status: 400 });
  }
  if (homeScore < 0 || awayScore < 0 || homeScore > 20 || awayScore > 20) {
    return NextResponse.json({ error: "Scores must be 0–20" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }
  if (match.isLocked || match.kickoffAt <= new Date()) {
    return NextResponse.json(
      { error: "Predictions closed for this match" },
      { status: 403 }
    );
  }

  await prisma.matchPrediction.upsert({
    where: { userId_matchId: { userId, matchId } },
    create: { userId, matchId, homeScore, awayScore },
    update: { homeScore, awayScore },
  });

  return NextResponse.json({ ok: true });
}
