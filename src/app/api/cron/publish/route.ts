// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPublishNotification } from "@/lib/notifications";


export async function GET() {


  const now = new Date();

  const entriesToPublish = await prisma.entry.findMany({
    where: {
      status: "scheduled",
      publishedAt: { lte: now },
    },
  });

  // update each to published
  for (const entry of entriesToPublish) {
    await prisma.entry.update({
      where: { id: entry.id },
      data: { status: "published" },
    });

    // send email notifications for newly published entry
    await sendPublishNotification(entry.id);
  }

  return NextResponse.json({
    published: entriesToPublish.length,
    message: `Published ${entriesToPublish.length} entries`,
  });
}