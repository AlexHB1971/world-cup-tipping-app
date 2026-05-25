import { NextResponse } from "next/server";
import { currentUserIsAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!(await currentUserIsAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const matchId = String(body.matchId ?? "");
  const homeScore = Number(body.homeScore);
  const awayScore = Number(body.awayScore);

  if (!matchId) {
    return NextResponse.json({ error: "matchId required" }, { status: 400 });
  }
  if (
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    awayScore < 0 ||
    homeScore > 20 ||
    awayScore > 20
  ) {
    return NextResponse.json(
      { error: "Scores must be whole numbers between 0 and 20" },
      { status: 400 }
    );
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore, isLocked: true },
  });

  return NextResponse.json({ ok: true });
}
