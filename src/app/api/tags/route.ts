//@ts-nocheck

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  //extracting projectid from query string
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 },
    );
  }

  //verification
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      userId: session.user.id,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // fetching all tags for this project
  const tags = await prisma.tag.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ tags });
}

// creating a new tag for a project
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, color, projectId } = await request.json();

  if (!name || !color || !projectId) {
    return NextResponse.json(
      { error: "Name, color, and projectId are required" },
      { status: 400 },
    );
  }

  // verification
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
      userId: session.user.id,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // checking for exisitng similar tags
  const existing = await prisma.tag.findFirst({
    where: {
      name,
      projectId,
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Tag already exists" }, { status: 409 });
  }

  const tag = await prisma.tag.create({
    data: {
      name,
      color,
      projectId,
    },
  });

  return NextResponse.json({ tag }, { status: 201 });
}
