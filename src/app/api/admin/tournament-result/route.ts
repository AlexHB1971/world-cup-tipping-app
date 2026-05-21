import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!isAdminRequest(request.headers.get("x-admin-secret"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const data = {
    semiFinalist1: body.semiFinalist1 ? String(body.semiFinalist1) : null,
    semiFinalist2: body.semiFinalist2 ? String(body.semiFinalist2) : null,
    semiFinalist3: body.semiFinalist3 ? String(body.semiFinalist3) : null,
    semiFinalist4: body.semiFinalist4 ? String(body.semiFinalist4) : null,
    finalist1: body.finalist1 ? String(body.finalist1) : null,
    finalist2: body.finalist2 ? String(body.finalist2) : null,
    winner: body.winner ? String(body.winner) : null,
  };

  await prisma.tournamentResult.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  return NextResponse.json({ ok: true });
}
