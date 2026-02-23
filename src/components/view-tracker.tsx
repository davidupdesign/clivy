"use client";

import { useEffect } from "react";

// sends all entry ids in a single request on page load
// the api handles ip-based deduplication so refreshing won't inflate counts
export default function ViewTracker({ entryIds }: { entryIds: string[] }) {
  useEffect(() => {
    if (entryIds.length === 0) return;

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryIds }),
    });
  }, []); // runs once on mount

  return null;
}
