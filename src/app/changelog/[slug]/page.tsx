//@ts-nocheck

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

import Reactions from "@/components/reactions";
import SubscribeForm from "@/components/subscribe-form";
import ViewTracker from "@/components/view-tracker";

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

  // Group entries by date for timeline view
  const groupedEntries = project.entries.reduce((acc, entry) => {
    const date = new Date(entry.publishedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, typeof project.entries>);

  return (
    <div className="min-h-screen bg-background">
      <ViewTracker entryIds={project.entries.map((e) => e.id)} />
      
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl font-bold mb-3 text-balance">{project.name}</h1>
          <p className="text-muted-foreground text-lg mb-8">Product updates and improvements</p>
          
          {/* Subscribe section */}
          <div className="inline-flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Get notified when we ship new features
            </p>
            <SubscribeForm projectId={project.id} />
          </div>
        </div>
      </header>

      {/* Timeline */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {project.entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No updates yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-12">
            {project.entries.map((entry) => (
              <article 
                key={entry.id} 
                className="group grid grid-cols-[160px_1fr] gap-8 items-start"
              >
                {/* Date on the left */}
                <time className="text-sm font-medium text-muted-foreground pt-1 sticky top-4">
                  {new Date(entry.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>

                {/* Entry content on the right with dot indicator */}
                <div className="relative space-y-4 before:absolute before:left-[-1.5rem] before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary before:ring-4 before:ring-primary/10">
                  {/* Entry header */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-pretty group-hover:text-primary transition-colors">
                      {entry.title}
                    </h2>
                    
                    {/* Version badge - more prominent */}
                    <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-foreground text-background">
                      v{entry.version}
                    </span>

                    {/* Tags - more readable */}
                    {entry.tags.length > 0 && (
                      <>
                        {entry.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide"
                            style={{
                              backgroundColor: tag.color,
                              color: '#ffffff',
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Content */}
                  <div className="prose prose-sm prose-headings:font-semibold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-ul:my-4 prose-li:my-1">
                    <ReactMarkdown>{entry.body}</ReactMarkdown>
                  </div>

                  {/* Reactions */}
                  <Reactions entryId={entry.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
