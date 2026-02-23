// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tagId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tagId } = await params;

  // fetch the tag and verify ownership through the project
  const tag = await prisma.tag.findUnique({
    where: { id: tagId },
    include: { project: true },
  });

  if (!tag || tag.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  await prisma.tag.delete({ where: { id: tagId } });

  return NextResponse.json({ success: true });
}
