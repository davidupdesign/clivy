"use client";

import { useState, useEffect } from "react";
import {
    Heart,
    ArrowBigDown,
    CircleHelp,
  } from "lucide-react";

// Each reaction has a key (stored in the database)
// and an icon component (displayed on screen).
// We use a Map-like array so we can loop over them
// and also look up the icon by key.
const REACTIONS = [
    { key: "heart", icon: Heart },
    { key: "downvote", icon: ArrowBigDown },
    { key: "question", icon: CircleHelp },
  ];

export default function Reactions({ entryId }: { entryId: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchReactions() {
      const response = await fetch(`/api/reactions?entryId=${entryId}`);
      if (response.ok) {
        const data = await response.json();
        setCounts(data.counts);
        setUserReactions(data.userReactions);
      }
    }
    fetchReactions();
  }, [entryId]);

  const handleReact = async (key: string) => {
    const response = await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, emoji: key }),
    });

    if (response.ok) {
      const data = await response.json();
      setCounts(data.counts);
      setUserReactions(data.userReactions);
    }
  };

  return (
    <div className="flex gap-2 mt-6">
      {REACTIONS.map(({ key, icon: Icon }) => (
        <button
          key={key}
          onClick={() => handleReact(key)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
            userReactions.includes(key)
              ? "bg-primary/10 border-primary"
              : "bg-white border-gray-200 hover:border-gray-300"
          }`}
        >
          {/* Icon is a component variable. We render it like <Icon />.
              size={14} sets the icon to 14px.
              When selected, the icon gets the primary color.
              className applies conditional styling. */}
          <Icon
            size={14}
            className={
              userReactions.includes(key)
                ? "text-primary"
                : "text-muted-foreground"
            }
          />
          {counts[key] > 0 && (
            <span className="text-xs text-muted-foreground">
              {counts[key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}