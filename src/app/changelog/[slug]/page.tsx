//@ts-nocheck

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

import Reactions from "@/components/reactions";

import SubscribeForm from "@/components/subscribe-form";

export default async function PuclicChangelogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      entries: {
        where: {
          status: "published",
        },
        orderBy: {
          publishedAt: "desc",
        },
        include: {
          tags: true,
        },
      },
    },
  });

  // not found
  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* project header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
        <p className="text-muted-foreground">Changelog</p>
      </header>

      {/* subscribe section */}
      <div className="mb-12 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Subscribe to get notified when we publish updates.
        </p>
        <div className="flex justify-center">
          <SubscribeForm projectId={project.id} />
        </div>
      </div>

      {/* entries */}
      {project.entries.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No entries yet. Check back soon.
        </p>
      ) : (
        <div className="space-y-12">
          {project.entries.map((entry) => (
            <article key={entry.id} className="border-b pb-12 last:border-0">
              {/* entru ehader, version and date */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary text-primary-foreground">
                  v{entry.version}
                </span>

                <time className="text-sm text-muted-foreground">
                  {new Date(entry.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>

              {/* entry title */}
              <h2 className="text-2xl font-bold mb-2">{entry.title}</h2>

              {/* tags */}
              {entry.tags.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: tag.color + "20",
                        color: tag.color,
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* markdown content rendered as html */}
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{entry.body}</ReactMarkdown>
              </div>
              <Reactions entryId={entry.id} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
