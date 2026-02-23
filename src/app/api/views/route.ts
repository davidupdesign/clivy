// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

// POST — record page views with ip-based deduplication
// accepts an array of entry ids and creates one view per entry per unique visitor
export async function POST(request: Request) {
  const { entryIds } = await request.json();

  if (!entryIds || !Array.isArray(entryIds) || entryIds.length === 0) {
    return NextResponse.json(
      { error: "entryIds array is required" },
      { status: 400 }
    );
  }

  // getting visitor ip — same approach as reactions route
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  // upsert each entry view — if this ip already viewed this entry, it's a no-op
  await Promise.all(
    entryIds.map((entryId) =>
      prisma.pageView
        .upsert({
          where: { entryId_ip: { entryId, ip } },
          create: { entryId, ip },
          update: {},
        })
        .catch(() => {})
    )
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
