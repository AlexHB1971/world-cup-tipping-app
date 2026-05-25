import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminSecret } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const secret = String(body.secret ?? "");

  if (!verifyAdminSecret(secret)) {
    return NextResponse.json({ error: "Invalid admin secret" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
