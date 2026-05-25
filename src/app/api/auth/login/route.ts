import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientIp, takeToken } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  // Tighter limit than register because brute-force is the main risk here.
  const rl = takeToken(`login:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a moment." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds) },
      }
    );
  }

  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
