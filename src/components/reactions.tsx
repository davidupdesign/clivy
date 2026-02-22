"use client";

import { useState, useEffect } from "react";
import {
    Heart,
    ArrowBigDown,
    CircleHelp,
  } from "lucide-react";

// Each reaction has a key (stored in the database),
// an icon component (displayed on screen), and a color
const REACTIONS = [
    { key: "heart", icon: Heart, color: "#ef4444" },
    { key: "downvote", icon: ArrowBigDown, color: "#f59e0b" },
    { key: "question", icon: CircleHelp, color: "#3b82f6" },
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
    <div className="flex gap-2 mt-6 pt-6 border-t">
      {REACTIONS.map(({ key, icon: Icon, color }) => {
        const isActive = userReactions.includes(key);
        return (
          <button
            key={key}
            onClick={() => handleReact(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-all hover:scale-105 active:scale-95 ${
              isActive
                ? "shadow-sm"
                : "bg-card border-border hover:bg-accent"
            }`}
            style={
              isActive
                ? {
                    backgroundColor: `${color}15`,
                    borderColor: color,
                    color: color,
                  }
                : undefined
            }
          >
            <Icon
              size={16}
              style={isActive ? { color } : undefined}
              className={!isActive ? "text-muted-foreground" : ""}
            />
            {counts[key] > 0 && (
              <span
                className={`text-xs font-medium ${
                  !isActive ? "text-muted-foreground" : ""
                }`}
                style={isActive ? { color } : undefined}
              >
                {counts[key]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
