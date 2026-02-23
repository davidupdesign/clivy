import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// returns the version string of the most recent entry for a project
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const latestEntry = await prisma.entry.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { version: true },
  });

  return NextResponse.json({ version: latestEntry?.version || null });
}
