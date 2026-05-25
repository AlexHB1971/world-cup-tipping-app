import { NextResponse } from "next/server";
import { currentUserIsAdmin } from "@/lib/auth";
import { syncFifaScores } from "@/lib/score-sync";

export async function POST() {
  if (!(await currentUserIsAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncFifaScores();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json(result);
}
