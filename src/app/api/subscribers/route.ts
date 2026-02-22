// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET — list subscribers for a project
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId, userId: session.user.id },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const subscribers = await prisma.subscriber.findMany({
    where: { projectId, active: true },
    orderBy: { subscribedAt: "desc" },
  });

  return NextResponse.json({ subscribers });
}


// POST — subscribe to a project
export async function POST(request: Request) {
  const { email, projectId } = await request.json();

  if (!email || !projectId) {
    return NextResponse.json(
      { error: "Email and projectId are required" },
      { status: 400 }
    );
  }

  if (!email.includes("@")) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json(
      { error: "Project not found" },
      { status: 404 }
    );
  }

  // Check if already subscribed
  const existing = await prisma.subscriber.findFirst({
    where: { email, projectId },
  });

  if (existing && existing.active) {
    return NextResponse.json(
      { error: "This email is already subscribed" },
      { status: 409 }
    );
  }

  // If they previously unsubscribed (active: false),
  // reactivate instead of creating a new record
  if (existing && !existing.active) {
    const reactivated = await prisma.subscriber.update({
      where: { id: existing.id },
      data: { active: true },
    });
    return NextResponse.json({ subscriber: reactivated }, { status: 200 });
  }

  // channel: "email" tells us how they subscribed.
  // Later when we add SMS, channel would be "sms"
  // and we'd store phone instead of email.
  const subscriber = await prisma.subscriber.create({
    data: {
      email,
      projectId,
      channel: "email",
    },
  });

  return NextResponse.json({ subscriber }, { status: 201 });
}