"use client";

import { useState, useEffect } from "react";
import { Heart, ArrowBigDown, CircleHelp } from "lucide-react";

// Each reaction has its own color when active
const REACTIONS = [
  {
    key: "heart",
    icon: Heart,
    activeColor: "text-red-500",
    activeBg: "bg-red-500/10",
    activeBorder: "border-red-500/40",
  },
  {
    key: "downvote",
    icon: ArrowBigDown,
    activeColor: "text-orange-500",
    activeBg: "bg-orange-500/10",
    activeBorder: "border-orange-500/40",
  },
  {
    key: "question",
    icon: CircleHelp,
    activeColor: "text-blue-500",
    activeBg: "bg-blue-500/10",
    activeBorder: "border-blue-500/40",
  },
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
    <div className="flex gap-2">
      {REACTIONS.map(({ key, icon: Icon, activeColor, activeBg, activeBorder }) => {
        const active = userReactions.includes(key);
        return (
          <button
            key={key}
            onClick={() => handleReact(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all hover:scale-105 active:scale-95 ${
              active
                ? `${activeBg} ${activeBorder} shadow-sm`
                : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <Icon
              size={14}
              className={active ? activeColor : "text-muted-foreground"}
            />
            {counts[key] > 0 && (
              <span
                className={`text-xs ${active ? activeColor : "text-muted-foreground"}`}
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
