import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientIp, takeToken } from "@/lib/rate-limit";

const MIN_PASSWORD = 8;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = takeToken(`register:${ip}`, 5, 60_000);
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
  const displayName = body.displayName
    ? String(body.displayName).trim()
    : null;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `Password must be at least ${MIN_PASSWORD} characters` },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      displayName,
    },
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
