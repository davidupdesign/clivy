// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE — removing a subscriber
export async function DELETE(
  request: Request,
  context: { params: Promise<{ subscriberId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subscriberId } = await context.params;

  // finding the subscriber and verifing the project belongs to the user
  const subscriber = await prisma.subscriber.findUnique({
    where: { id: subscriberId },
    include: { project: true },
  });

  if (!subscriber) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (subscriber.project.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.subscriber.delete({ where: { id: subscriberId } });

  return NextResponse.json({ message: "Subscriber removed" });
}
