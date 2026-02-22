// @ts-nocheck
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "modified", label: "Last Modified" },
  { value: "newest", label: "Date Created (New to Old)" },
  { value: "oldest", label: "Date Created (Old to New)" },
];

export default function ProjectSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") || "modified";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-lg bg-muted/40 px-3 py-2">
      <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
      <select
        value={current}
        onChange={handleChange}
        className="bg-transparent text-sm font-medium text-muted-foreground cursor-pointer outline-none hover:text-foreground transition-colors"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
