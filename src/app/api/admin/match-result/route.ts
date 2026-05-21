import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!isAdminRequest(request.headers.get("x-admin-secret"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const matchId = String(body.matchId ?? "");
  const homeScore = Number(body.homeScore);
  const awayScore = Number(body.awayScore);

  if (!matchId || Number.isNaN(homeScore) || Number.isNaN(awayScore)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore, awayScore, isLocked: true },
  });

  return NextResponse.json({ ok: true });
}
