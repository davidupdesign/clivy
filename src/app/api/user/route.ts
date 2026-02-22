// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE — delete entire user account
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // cascade delete handles all projects, entries, etc
  await prisma.user.delete({
    where: { id: session.user.id },
  });

  return NextResponse.json({ message: "Account deleted" });
}