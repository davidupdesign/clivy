// @ts-nocheck

import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      entries: {
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!project) {
    return new Response("Not found", { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const changelogUrl = `${origin}/changelog/${slug}`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${project.name} Changelog</title>
    <link>${changelogUrl}</link>
    <description>Latest updates for ${project.name}</description>
    <language>en</language>
    ${project.entries
      .map(
        (entry) => `
    <item>
      <title>v${entry.version} - ${entry.title}</title>
      <description><![CDATA[${entry.body}]]></description>
      <pubDate>${new Date(entry.publishedAt).toUTCString()}</pubDate>
      <link>${changelogUrl}</link>
      <guid>${origin}/entry/${entry.id}</guid>
    </item>`,
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
