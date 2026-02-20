// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// get reaction counts for an entry, return grouped counts
// also returns which emojis the current visitor already reacted with
export async function GET(request: Request) {
  const url = new URL(request.url);
  const entryId = url.searchParams.get("entryId");

  if (!entryId) {
    return NextResponse.json({ error: "entryId is required" }, { status: 400 });
  }

  // getting visitor's ip address
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  // fetching all reactions for this entry
  const reactions = await prisma.reaction.findMany({
    where: { entryId },
  });

  // grouping reactions by emoji and counting them
  const counts = reactions.reduce(
    (acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // finding which emojis this specific visitor already reacted with
  // filtering reactions by ip, then extracting emoji strings
  const userReactions = reactions
    .filter((r) => r.ip === ip)
    .map((r) => r.emoji);

  return NextResponse.json({ counts, userReactions });
}

// POST — add or remove reaction
// if the visitor already reacted with this emoji, remove it
// if they havent, we will add it
export async function POST(request: Request) {
  const { entryId, emoji } = await request.json();

  if (!entryId || !emoji) {
    return NextResponse.json(
      { error: "entryId and emoji are required" },
      { status: 400 },
    );
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  // checking if this visitor already reacted with this emoji
  const existing = await prisma.reaction.findFirst({
    where: { entryId, ip },
  });

  if (existing && existing.emoji === emoji) {
    // clicked the same emoji again = toggle off(remove it)
    await prisma.reaction.delete({
      where: { id: existing.id },
    });
  } else if (existing) {
    //clicked a different emoji = swap(deleting old, creating new)
    await prisma.reaction.delete({
      where: { id: existing.id },
    });
    await prisma.reaction.create({
      data: { entryId, emoji, ip },
    });
  } else {
    // no existing reaction = creating new
    await prisma.reaction.create({
      data: { entryId, emoji, ip },
    });
  }

  // returning updated counts
  const reactions = await prisma.reaction.findMany({
    where: { entryId },
  });

  const counts = reactions.reduce(
    (acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const userReactions = reactions
    .filter((r) => r.ip === ip)
    .map((r) => r.emoji);

  return NextResponse.json({ counts, userReactions });
}
