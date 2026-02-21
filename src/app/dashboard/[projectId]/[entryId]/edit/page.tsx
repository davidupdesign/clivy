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

export default function EditEntryPage({
  params,
}: {
  params: Promise<{ projectId: string; entryId: string }>;
}) {
  //use() unwraps the params promise in a client component
  // we get both projectid and entryid from the url
  const { projectId, entryId } = use(params);
  const router = useRouter();

  //form state - same as new entry page
  const [title, setTitle] = useState("");
  const [version, setVersion] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("draft");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  //fetching state - when the page loads we fetch the existing entry data from the api to pre-fill the for.
  const [fetching, setFetching] = useState(true);

  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");

  // scheduling
  const [scheduledAt, setScheduledAt] = useState("");

  // fetching available tags when page loads

  useEffect(() => {
    async function fetchData() {
      const [entryResponse, tagsResponse] = await Promise.all([
        fetch(`/api/entries/${entryId}`),
        fetch(`/api/tags?projectId=${projectId}`),
      ]);

      //prefilling the page with exisiting data
      if (entryResponse.ok) {
        const entryData = await entryResponse.json();
        setTitle(entryData.entry.title);
        setVersion(entryData.entry.version);
        setBody(entryData.entry.body);
        setStatus(entryData.entry.status);
        if (
          entryData.entry.publishedAt &&
          entryData.entry.status === "scheduled"
        ) {
          setScheduledAt(
            new Date(entryData.entry.publishedAt).toISOString().slice(0, 16),
          );
        }
        setSelectedTagIds(entryData.entry.tags.map((tag: Tag) => tag.id));
      } else {
        setError("Failed to load entry");
      }

      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        setAvailableTags(tagsData.tags);
      }

      setFetching(false);
    }

    fetchData();
    // entryid is the dependency array. entryid doesnt change on this page, it runs once
  }, [entryId, projectId]);

  //toggling tag - on/off
  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  };

  //creating tag
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
      setAvailableTags((prev) => [...prev, data.tag]);
      setSelectedTagIds((prev) => [...prev, data.tag.id]);
      setNewTagName("");
    }
  };

  //submit handler - sends PATCH instead of POST
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    //PATCH
    const response = await fetch(`/api/entries/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        version,
        status,
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

    // back to the project page after saving
    router.push(`/dashboard/${projectId}`);
  };

  //delete handler
  const handleDelete = async () => {
    //preventing accidental deletions with window.confirm()
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    const response = await fetch(`/api/entries/${entryId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Failed to delete entry.");
      return;
    }

    router.push(`/dashboard/${projectId}`);
  };

  //showing loading while fetching entry data
  if (fetching) {
    return <p className="text-muted-foreground">Loading entry...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Entry</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Changes"
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

        {/* tags */}
        <div className="space-y-3">
          <Label>Tags</Label>

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

          <div className="flex gap-2 items-center">
            <Input
              placeholder="New tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="w-40"
            />
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

        {/* editor and preview side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* editor */}
          <div className="space-y-2">
            <Label htmlFor="body">Content (Markdown)</Label>
            <textarea
              id="body"
              className="w-full min-h-[400px] p-3 border rounded-md bg-background text-sm font-mono resize-y"
              placeholder="Write your changelog in markdown."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          {/* preview */}
          <div className="space-y-2">
            <Label htmlFor="preview">Preview</Label>
            <Card className="min-h-[400px]">
              <CardContent className="pt-6 prose prose-sm max-w-none">
                {body ? (
                  <ReactMarkdown>{body}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground">
                    Start typing to see the preview.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* errors */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* buttons */}
        <div className="flex gap-3">
          {/* save/draft button */}
          <Button
            type="submit"
            disabled={loading}
            onClick={() => setStatus("draft")}
          >
            {loading ? "Saving..." : "Save Draft"}
          </Button>

          {/* publish button */}
          <Button
            type="submit"
            variant="outline"
            disabled={loading}
            onClick={() => setStatus("published")}
          >
            Publish
          </Button>

          {/* scheduled button*/}
          <div className="flex gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor="scheduledAt" className="text-xs">
                Schedule for
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

          {/* delete button */}
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </form>
    </div>
  );
}
