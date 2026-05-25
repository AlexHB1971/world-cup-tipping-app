import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, error: null };
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const { id: targetId } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const isAdmin = Boolean(body.isAdmin);

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.id === user!.id && target.isAdmin && !isAdmin) {
    return NextResponse.json(
      { error: "You can't demote yourself. Ask another admin to do it." },
      { status: 400 }
    );
  }

  if (target.isAdmin && !isAdmin) {
    const remainingAdmins = await prisma.user.count({
      where: { isAdmin: true, id: { not: target.id } },
    });
    if (remainingAdmins === 0) {
      return NextResponse.json(
        { error: "Refusing to demote the last admin." },
        { status: 400 }
      );
    }
  }

  await prisma.user.update({ where: { id: targetId }, data: { isAdmin } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin();
  if (error) return error;

  const { id: targetId } = await ctx.params;
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.id === user!.id) {
    return NextResponse.json(
      { error: "You can't delete your own account from here." },
      { status: 400 }
    );
  }

  if (target.isAdmin) {
    const remainingAdmins = await prisma.user.count({
      where: { isAdmin: true, id: { not: target.id } },
    });
    if (remainingAdmins === 0) {
      return NextResponse.json(
        { error: "Refusing to delete the last admin." },
        { status: 400 }
      );
    }
  }

  // Predictions cascade via Prisma onDelete: Cascade
  await prisma.user.delete({ where: { id: targetId } });
  return NextResponse.json({ ok: true });
}
