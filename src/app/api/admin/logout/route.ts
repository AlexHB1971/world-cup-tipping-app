import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  await destroyAdminSession();
  const url = new URL("/admin", request.url);
  return NextResponse.redirect(url);
}
