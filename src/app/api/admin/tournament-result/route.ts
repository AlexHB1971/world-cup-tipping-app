import { NextResponse } from "next/server";
import { filterRealTeams } from "@/data/knockout-bracket";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
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

  const realTeams = new Set(
    filterRealTeams(await prisma.team.findMany({ select: { name: true, code: true } })).map(
      (t) => t.name
    )
  );

  for (const [field, value] of Object.entries(data)) {
    if (value && !realTeams.has(value)) {
      return NextResponse.json(
        { error: `Unknown team for ${field}: ${value}` },
        { status: 400 }
      );
    }
  }

  const semis = [
    data.semiFinalist1,
    data.semiFinalist2,
    data.semiFinalist3,
    data.semiFinalist4,
  ].filter(Boolean) as string[];
  const semiSet = new Set(semis);
  if (semiSet.size !== semis.length) {
    return NextResponse.json(
      { error: "Semi-finalists must be distinct" },
      { status: 400 }
    );
  }

  const finalists = [data.finalist1, data.finalist2].filter(Boolean) as string[];
  const finalistSet = new Set(finalists);
  if (finalistSet.size !== finalists.length) {
    return NextResponse.json(
      { error: "Finalists must be distinct" },
      { status: 400 }
    );
  }
  for (const f of finalists) {
    if (!semiSet.has(f)) {
      return NextResponse.json(
        { error: `Finalist ${f} must be one of the semi-finalists` },
        { status: 400 }
      );
    }
  }

  if (data.winner && !finalistSet.has(data.winner)) {
    return NextResponse.json(
      { error: `Winner ${data.winner} must be one of the finalists` },
      { status: 400 }
    );
  }

  await prisma.tournamentResult.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  return NextResponse.json({ ok: true });
}
