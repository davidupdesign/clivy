// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — record a page view
export async function POST(request: Request) {
  const { entryId } = await request.json();

  if (!entryId) {
    return NextResponse.json(
      { error: "entryId is required" },
      { status: 400 }
    );
  }

  // verifing thst the entry exists
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
  });

  if (!entry) {
    return NextResponse.json(
      { error: "Entry not found" },
      { status: 404 }
    );
  }

  // each call = one view. no deduplication — same visitor refreshing counts again
  // ! for the future - dedupe by ip + time window.
  await prisma.pageView.create({
    data: { entryId },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}