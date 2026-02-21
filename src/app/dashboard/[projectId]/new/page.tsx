"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type Tag = {
  id: string;
  name: string;
  color: string;
};

export default function NewEntryPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("draft");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");

  //sceduling
  const [scheduledAt, setScheduledAt] = useState("");

  // fetching available tags when page loads
  useEffect(() => {
    async function fetchTags() {
      const response = await fetch(`/api/tags?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.tags);
      }
    }
    fetchTags();
  }, [projectId]);

  // toggle for a tag - on/off
  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  };

  // creating new tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    const response = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTagName,
        color: newTagColor,
        projectId,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // adding new tag to the available list
      setAvailableTags((prev) => [...prev, data.tag]);
      // auto-selecting
      setSelectedTagIds((prev) => [...prev, data.tag.id]);
      // clesar the input
      setNewTagName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        version,
        status,
        projectId,
        tagIds: selectedTagIds,
        scheduledAt: status === "scheduled" ? scheduledAt : null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push(`/dashboard/${projectId}`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">New Changelog Entry</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What changed?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              placeholder="1.0.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              required
            />
          </div>
        </div>

        {/* tags section */}
        <div className="space-y-3">
          <Label>Tags</Label>

          {/* existing tags — click to toggle */}
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? "border-transparent text-white"
                    : "border-gray-200 bg-white"
                }`}
                style={
                  selectedTagIds.includes(tag.id)
                    ? { backgroundColor: tag.color }
                    : { color: tag.color }
                }
              >
                {tag.name}
              </button>
            ))}
          </div>

          {/* create new tag inline */}
          <div className="flex gap-2 items-center">
            <Input
              placeholder="New tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="w-40"
            />
            {/* color picker */}
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCreateTag}
            >
              Add Tag
            </Button>
          </div>
        </div>

        {/* markdown editor and preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* markdown */}
          <div className="space-y-2">
            <Label htmlFor="body">Content (Markdown)</Label>
            <textarea
              id="body"
              className="w-full min-h-[400px] p-3 border rounded-md bg-background text-sm font-mono resize-y"
              placeholder="Write your changelog in markdown..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          {/* preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <Card className="min-h-[400px]">
              <CardContent className="pt-6 prose prose-sm max-w-none">
                {body ? (
                  <ReactMarkdown>{body}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground">
                    Start typing to see preview...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* buttons */}
        <div className="flex gap-3">
          {/* draft */}
          <Button
            type="submit"
            disabled={loading}
            onClick={() => setStatus("draft")}
          >
            {loading ? "Saving..." : "Save as Draft"}
          </Button>
          {/* publish */}
          <Button
            type="submit"
            variant="outline"
            disabled={loading}
            onClick={() => setStatus("published")}
          >
            Publish Now
          </Button>

          {/* scheduled */}
          <div className="flex gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor="scheduledAt" className="text-xs">
                Scheduled for
              </Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-auto"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={loading || !scheduledAt}
              onClick={() => setStatus("scheduled")}
            >
              Schedule
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
