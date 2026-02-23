"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // autogenerating slug
  // lowercase-replacing et w/ "-"
  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    );
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, website: website || null }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    // redirectiong to the new project's dash
    router.push(`/dashboard/${data.project.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Projects
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Create a new project
      </h1>
      <p className="text-base text-muted-foreground mb-10">
        Each project has its own changelog page.
      </p>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base">
            Project Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="My Cooool App"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="h-11 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" className="text-base">
            Slug
          </Label>
          <Input
            id="slug"
            type="text"
            placeholder="my-awesome-app"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="h-11 text-base"
          />
          <p className="text-sm text-muted-foreground">
            Public URL: /changelog/{slug || "your-slug"}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-base">
            Website <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="website"
            type="text"
            placeholder="https://yoursite.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="h-11 text-base"
          />
          <p className="text-sm text-muted-foreground">
            Shown as a clickable link on your public changelog page.
          </p>
        </div>

        {error && <p className="text-base text-red-500">{error}</p>}

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Creating..." : "Create Project"}
        </Button>
      </form>
    </motion.div>
  );
}
