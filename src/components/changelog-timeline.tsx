// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import Reactions from "@/components/reactions";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

// pagination — how many entries to show initially and per "show more" click
const INITIAL_COUNT = 5;
const LOAD_MORE_COUNT = 5;

type DateGroup = {
  date: string;
  entries: any[];
};

// hook that detects when a sticky header becomes stuck to the top of the viewport.
// uses an invisible 1px sentinel div — when it scrolls out of view, the header is "stuck".
function useStickyObserver() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return { sentinelRef, isStuck };
}

// sticky header for each changelog entry — shows date, version badge, timeline dot, and title.
// spans all 3 grid columns and sticks to the top when scrolling.
// a full-width bottom shadow fades in only when the header is stuck.
function StickyEntryHeader({
  date,
  version,
  title,
}: {
  date: string;
  version: string;
  title: string;
}) {
  const { sentinelRef, isStuck } = useStickyObserver();

  return (
    <>
      {/* invisible sentinel — when this scrolls out of view, the header is "stuck" */}
      <div ref={sentinelRef} className="absolute top-0 h-px w-full" />
      <div
        className={`md:col-span-3 relative md:sticky md:top-0 ${isStuck ? "md:z-40" : "md:z-10"}`}
      >
        {/* solid background so content doesn't show through */}
        <div className="absolute inset-0 bg-background" />
        {/* full-width bottom shadow — only visible when stuck */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-screen -bottom-2 h-2 transition-opacity duration-500 pointer-events-none"
          style={{
            opacity: isStuck ? 1 : 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.06), transparent)",
          }}
        />
        {/* 3-column layout: date+version | timeline dot | title */}
        <div className="relative py-4 md:grid md:grid-cols-[12rem_2rem_1fr] md:gap-0 md:items-center">
          {/* desktop: date and version badge on the left */}
          <div className="hidden md:block text-right pr-5">
            <time className="text-sm font-medium text-muted-foreground block">
              {date}
            </time>
            <span className="inline-flex items-center rounded-full bg-foreground text-background px-2.5 py-1 text-xs font-semibold mt-1.5">
              v{version}
            </span>
          </div>
          {/* desktop: timeline dot in the center column */}
          <div className="hidden md:flex justify-center">
            <div className="h-4 w-4 rounded-full border-2 border-primary bg-background flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
          </div>
          <div className="md:pl-8">
            {/* mobile: date, version, and dot inline above the title */}
            <div className="flex items-center gap-3 mb-2 md:hidden">
              <div className="h-3 w-3 rounded-full border-2 border-primary bg-background flex items-center justify-center shrink-0">
                <div className="h-1 w-1 rounded-full bg-primary" />
              </div>
              <time className="text-sm font-medium text-muted-foreground">
                {date}
              </time>
              <span className="inline-flex items-center rounded-full bg-foreground text-background px-2 py-0.5 text-xs font-semibold">
                v{version}
              </span>
            </div>
            {/* entry title */}
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
        </div>
      </div>
    </>
  );
}

// framer-motion variants — entries fade in and slide up with a staggered delay
const entryVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.1, ease: "easeOut" },
  }),
};

// main timeline component — receives grouped entries and handles pagination
export default function ChangelogTimeline({
  dateGroups,
}: {
  dateGroups: DateGroup[];
}) {
  // flatten all entries so we can paginate across date groups
  const allEntries = dateGroups.flatMap((g) => g.entries);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const hasMore = visibleCount < allEntries.length;

  // build visible groups from the flat paginated slice
  const visibleEntries = new Set(
    allEntries.slice(0, visibleCount).map((e) => e.id),
  );
  const visibleGroups = dateGroups
    .map((group) => ({
      ...group,
      entries: group.entries.filter((e) => visibleEntries.has(e.id)),
    }))
    .filter((group) => group.entries.length > 0);

  // running index for stagger animation delay
  let entryIndex = 0;

  return (
    <>
      <div>
        {visibleGroups.map((group) => (
          <div key={group.date}>
            {group.entries.map((entry) => {
              const i = entryIndex++;
              return (
                // each entry is a 3-column grid: date/version | timeline line | content
                <motion.article
                  key={entry.id}
                  custom={i}
                  variants={entryVariants}
                  initial="hidden"
                  animate="visible"
                  className="relative md:grid md:grid-cols-[12rem_2rem_1fr] md:gap-0"
                >
                  {/* sticky header — date, version, timeline dot, title */}
                  <StickyEntryHeader
                    date={group.date}
                    version={entry.version}
                    title={entry.title}
                  />

                  {/* left column: empty spacer below sticky header */}
                  <div className="hidden md:block" />

                  {/* middle column: vertical timeline line */}
                  <div className="hidden md:flex justify-center">
                    <div className="w-px bg-border h-full" />
                  </div>

                  {/* right column: entry content (tags, image, body, reactions) */}
                  <div className="pt-1 pb-10 min-w-0 md:pl-8">
                    {/* tags */}
                    {entry.tags.length > 0 && (
                      <div className="flex gap-2.5 mb-5">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase shadow-xs"
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

                    {/* header image — slightly narrower than the sticky header */}
                    {entry.headerImage && (
                      <div
                        className="max-w-xl overflow-hidden rounded-2xl sm:rounded-4xl mb-5 shadow-sm"
                        style={{ aspectRatio: "5/2" }}
                      >
                        <img
                          src={entry.headerImage}
                          alt={`${entry.title} header`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* markdown body — rendered from entry content */}
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{entry.body}</ReactMarkdown>
                    </div>

                    {/* reactions — emoji reactions for each entry */}
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

      {/* "show more" button — loads the next batch of entries */}
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
            className="text-md h-12 font-bold border-2 cursor-pointer transition-all duration-200"
            onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
          >
            Show More
            <ChevronDown className="size-5 mt-0.5 stroke-3" />
          </Button>
        </motion.div>
      )}
    </>
  );
}
