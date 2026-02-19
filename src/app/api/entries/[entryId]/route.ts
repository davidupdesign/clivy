// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — fetch a single entry
export async function GET(
  request: Request,
  context: { params: Promise<{ entryId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { entryId } = await context.params;

  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: {
      project: true,
      tags: true,
    },
  });

  if (!entry) {
    return NextResponse.json(
      { error: "Entry not found" },
      { status: 404 }
    );
  }

  if (entry.project.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  return NextResponse.json({ entry });
}

// PATCH — update an existing entry
export async function PATCH(
  request: Request,
  context: { params: Promise<{ entryId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // await params
  const { entryId } = await context.params;

  // reading json body (all the fields that user changed)
  const { title, body, version, status } = await request.json();

  // 1. finding the entry and verifying it belongs to the current user
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: { project: true },
  });

  // entry doesnt exist
  if (!entry) {
    return NextResponse.json(
      { error: "Entry not found" },
      { status: 404 }
    );
  }

  // entry belongs to another user
  if (entry.project.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  // 2. build update object
  const updateData = {
    ...(title && { title }),
    ...(body && { body }),
    ...(version && { version }),
    ...(status && { status }),
    ...(status === "published" &&
      !entry.publishedAt && {
        publishedAt: new Date(),
      }),
  };

  // 3. update entry
  const updatedEntry = await prisma.entry.update({
    where: { id: entryId },
    data: updateData,
  });

  return NextResponse.json({ entry: updatedEntry });
}

// DELETE — remove an entry permanently
export async function DELETE(
  request: Request,
  context: { params: Promise<{ entryId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { entryId } = await context.params;

  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: { project: true },
  });

  if (!entry) {
    return NextResponse.json(
      { error: "Entry not found" },
      { status: 404 }
    );
  }

  if (entry.project.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  await prisma.entry.delete({
    where: { id: entryId },
  });

  return NextResponse.json({ message: "Entry deleted" });
}