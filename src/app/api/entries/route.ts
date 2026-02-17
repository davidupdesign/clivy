// @ts-nocheck

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body, version, status, projectId } = await request.json();

  if (!title || !body || !version || !projectId) {
    return NextResponse.json(
      { error: "Title, body, version, and projectId are required" },
      { status: 400 },
    );
  }

  //project-user verification
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      userId: session.user.id,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { staus: 404 });
  }

  const entry = await prisma.entry.create({
    data: {
      title,
      body,
      version,
      status: status || "draft",
      publushedAt: status === "published" ? new Date() : null,
      projectId,
    },
  });

  return NextResponse.json({ entry }, { status: 201 });
}
