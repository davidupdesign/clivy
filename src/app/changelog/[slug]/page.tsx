// @ts-nocheck

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Rss } from "lucide-react";

import SubscribeForm from "@/components/subscribe-form";
import ViewTracker from "@/components/view-tracker";
import ChangelogNavbar from "@/components/changelog-navbar";
import ChangelogTimeline from "@/components/changelog-timeline";

// Group entries by their published date string
function groupByDate(entries: any[]) {
  const groups: { date: string; entries: any[] }[] = [];

  for (const entry of entries) {
    const dateStr = new Date(entry.publishedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const existing = groups.find((g) => g.date === dateStr);
    if (existing) {
      existing.entries.push(entry);
    } else {
      groups.push({ date: dateStr, entries: [entry] });
    }
  }

  return groups;
}

export default async function PublicChangelogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      entries: {
        where: { status: "published" },
        orderBy: { publishedAt: "desc" },
        include: { tags: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const dateGroups = groupByDate(project.entries);

  return (
    <div className="min-h-screen">
      <ChangelogNavbar />
      <ViewTracker entryIds={project.entries.map((e) => e.id)} />

      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{project.name}</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Product updates and improvements
          </p>

          {/* Subscribe + RSS row */}
          <div className="flex items-center justify-center gap-4">
            <SubscribeForm projectId={project.id} />
            <Link
              href={`/changelog/${slug}/rss`}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="RSS Feed"
            >
              <Rss className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Timeline */}
      <main className="max-w-5xl mx-auto px-4 py-14">
        {project.entries.length === 0 ? (
          <p className="text-center text-lg text-muted-foreground py-12">
            No updates yet. Check back soon!
          </p>
        ) : (
          <ChangelogTimeline dateGroups={dateGroups} />
        )}
      </main>

      {/* Powered by Clivy */}
      <footer className="border-t py-8">
        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          Powered by
          <Link
            href="/"
            className="font-semibold text-foreground hover:underline"
          >
            Clivy
          </Link>
        </div>
      </footer>
    </div>
  );
}
