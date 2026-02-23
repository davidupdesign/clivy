// @ts-nocheck
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // load current project data
  useEffect(() => {
    async function fetchProject() {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.project.name);
        setSlug(data.project.slug);
        setWebsite(data.project.website || "");
      }
      setFetching(false);
    }
    fetchProject();
  }, [projectId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, website: website || null }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Project updated");
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this project and all its entries?")) return;

    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });

    if (res.ok) {
      toast.success("Project deleted");
      router.push("/dashboard");
    } else {
      toast.error("Failed to delete project");
    }
  };

  if (fetching) {
    return <p className="text-lg text-muted-foreground">Loading...</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        href={`/dashboard/${projectId}`}
        className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to project
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-10">Project Settings</h1>

      <form onSubmit={handleSave} className="max-w-lg space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base">Project Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" className="text-base">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="h-11 text-base"
          />
          <p className="text-sm text-muted-foreground">
            Your changelog URL: /changelog/{slug}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-base">
            Website <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yoursite.com"
            className="h-11 text-base"
          />
          <p className="text-sm text-muted-foreground">
            Shown as a clickable link on your public changelog page.
          </p>
        </div>

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <hr className="my-10 max-w-lg" />

      <div className="max-w-lg">
        <h2 className="text-base font-medium text-red-600 mb-2">Danger zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete this project and all its entries.
        </p>
        <Button type="button" variant="destructive" size="lg" onClick={handleDelete}>
          Delete Project
        </Button>
      </div>
    </motion.div>
  );
}
