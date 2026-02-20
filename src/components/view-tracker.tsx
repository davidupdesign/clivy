"use client";

import { useEffect } from "react";

export default function ViewTracker({ entryIds }: { entryIds: string[] }) {
  useEffect(() => {
    entryIds.forEach((entryId) => {
      fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId }),
      });
    });
  }, []); // empty array = runs once on mount

  return null;
}
