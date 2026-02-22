// @ts-nocheck
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import Reactions from "@/components/reactions";
import { Button } from "@/components/ui/button";

const INITIAL_COUNT = 5;
const LOAD_MORE_COUNT = 5;

type DateGroup = {
  date: string;
  entries: any[];
};

const entryVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.1, ease: "easeOut" },
  }),
};

export default function ChangelogTimeline({ dateGroups }: { dateGroups: DateGroup[] }) {
  // Flatten all entries to count them, but we paginate by entries across groups
  const allEntries = dateGroups.flatMap((g) => g.entries);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const hasMore = visibleCount < allEntries.length;

  // Build visible groups from the flat slice
  const visibleEntries = new Set(allEntries.slice(0, visibleCount).map((e) => e.id));
  const visibleGroups = dateGroups
    .map((group) => ({
      ...group,
      entries: group.entries.filter((e) => visibleEntries.has(e.id)),
    }))
    .filter((group) => group.entries.length > 0);

  let entryIndex = 0;

  return (
    <>
      <div>
        {visibleGroups.map((group) => (
          <div key={group.date}>
            {group.entries.map((entry) => {
              const i = entryIndex++;
              return (
                <motion.article
                  key={entry.id}
                  custom={i}
                  variants={entryVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative md:grid md:grid-cols-[12rem_2rem_1fr] md:gap-0"
                >

                  {/* ===== Sticky header row spanning all 3 columns ===== */}
                  <div className="md:col-span-3 sticky top-0 z-10">
                    <div className="absolute inset-0 bg-background" />
                    <div className="absolute left-0 right-0 -bottom-1 h-1 bg-linear-to-b from-background to-transparent" />
                    <div className="relative pt-6 pb-3 md:grid md:grid-cols-[12rem_2rem_1fr] md:gap-0 md:items-center">

                      {/* Left: date + version — hidden on mobile */}
                      <div className="hidden md:block text-right pr-5">
                        <time className="text-base font-medium text-muted-foreground block">
                          {group.date}
                        </time>
                        <span className="inline-flex items-center rounded-full bg-foreground text-background px-3 py-1 text-sm font-semibold mt-1.5">
                          v{entry.version}
                        </span>
                      </div>

                      {/* Middle: circle — hidden on mobile */}
                      <div className="hidden md:flex justify-center">
                        <div className="h-4 w-4 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        </div>
                      </div>

                      {/* Right: title (+ mobile date/version) */}
                      <div className="md:pl-8">
                        <div className="flex items-center gap-3 mb-2 md:hidden">
                          <div className="h-3 w-3 rounded-full border-2 border-primary bg-background flex items-center justify-center shrink-0">
                            <div className="h-1 w-1 rounded-full bg-primary" />
                          </div>
                          <time className="text-base font-medium text-muted-foreground">
                            {group.date}
                          </time>
                          <span className="inline-flex items-center rounded-full bg-foreground text-background px-2.5 py-0.5 text-sm font-semibold">
                            v{entry.version}
                          </span>
                        </div>

                        <h2 className="text-3xl font-bold">{entry.title}</h2>
                      </div>
                    </div>
                  </div>

                  {/* ===== Left column: empty space below sticky header ===== */}
                  <div className="hidden md:block" />

                  {/* ===== Middle column: vertical line ===== */}
                  <div className="hidden md:flex justify-center">
                    <div className="w-px bg-border h-full" />
                  </div>

                  {/* ===== Right column: entry content ===== */}
                  <div className="pt-2 pb-16 min-w-0 md:pl-8">

                    {/* Tags */}
                    {entry.tags.length > 0 && (
                      <div className="flex gap-2.5 mb-5">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="text-base font-bold px-3 py-1 rounded-full uppercase"
                            style={{
                              backgroundColor: tag.color + "25",
                              color: tag.color,
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Header Image */}
                    {entry.headerImage && (
                      <div className="w-full overflow-hidden rounded-4xl mb-6" style={{ aspectRatio: "5/2" }}>
                        <img
                          src={entry.headerImage}
                          alt={`${entry.title} header`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Markdown body */}
                    <div className="prose prose-base max-w-none">
                      <ReactMarkdown>{entry.body}</ReactMarkdown>
                    </div>

                    {/* Reactions */}
                    <div className="border-t pt-6 mt-6">
                      <Reactions entryId={entry.id} />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ))}
      </div>

      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center pt-4 pb-8"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
          >
            Show more
          </Button>
        </motion.div>
      )}
    </>
  );
}
