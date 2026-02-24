"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploadField from "@/components/image-upload-field";
import { ArrowLeft, Plus, Calendar, X } from "lucide-react";
import { motion } from "framer-motion";

const TAG_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Teal", value: "#14b8a6" },
];

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
  const [showSchedule, setShowSchedule] = useState(false);

  // header image
  const [headerImage, setHeaderImage] = useState<string | null>(null);

  // editor/preview toggle
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");

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
          setShowSchedule(true);
        }
        setSelectedTagIds(entryData.entry.tags.map((tag: Tag) => tag.id));
        if (entryData.entry.headerImage) {
          setHeaderImage(entryData.entry.headerImage);
        }
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

  //toggling tag - on/off (max 4)
  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) return prev.filter((t) => t !== tagId);
      if (prev.length >= 4) return prev;
      return [...prev, tagId];
    });
  };

  // deleting a tag
  const handleDeleteTag = async (tagId: string) => {
    const response = await fetch(`/api/tags/${tagId}`, { method: "DELETE" });
    if (response.ok) {
      setAvailableTags((prev) => prev.filter((t) => t.id !== tagId));
      setSelectedTagIds((prev) => prev.filter((t) => t !== tagId));
    }
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
        headerImage,
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
    return <p className="text-lg text-muted-foreground">Loading entry...</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        href={`/dashboard/${projectId}`}
        className="inline-flex items-center gap-2 text-lg text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to project
      </Link>

      <h1 className="text-4xl font-bold tracking-tight mb-10">Edit Entry</h1>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* title + version — title gets more space */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-5">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-2xl font-medium">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Changes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-13 text-lg"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="version" className="text-2xl font-medium">
              Version
            </Label>
            <Input
              id="version"
              placeholder="1.0.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              required
              className="h-13 text-lg"
            />
          </div>
        </div>

        {/* tags */}
        <div className="space-y-4">
          <Label className="text-2xl font-medium">Tags</Label>

          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {availableTags.map((tag) => (
                <div key={tag.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-base font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer uppercase ${
                      selectedTagIds.includes(tag.id)
                        ? "ring-2 ring-offset-2 ring-current"
                        : "opacity-70 hover:opacity-90"
                    }`}
                    style={{
                      backgroundColor: tag.color + "25",
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-foreground/80 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* create new tag inline */}
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              placeholder="New tag name (Max 16 Ch.)"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              maxLength={16}
              className="w-60 h-12 text-base"
            />
            {/* preset color swatches */}
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewTagColor(c.value)}
                  className="w-9 h-9 rounded-full cursor-pointer transition-all border-2"
                  style={{
                    backgroundColor: c.value,
                    borderColor:
                      newTagColor === c.value
                        ? "var(--foreground)"
                        : "transparent",
                    transform:
                      newTagColor === c.value ? "scale(1.15)" : "scale(1)",
                  }}
                  title={c.name}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              className="h-12 px-6 text-base gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {/* header image */}
        <div className="space-y-4">
          <Label className="text-2xl font-medium">
            Header Image (optional)
          </Label>
          <ImageUploadField
            initialImage={headerImage}
            onImageChange={(url) => setHeaderImage(url)}
          />
        </div>

        {/* editor and preview with toggle */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex bg-muted rounded-full p-1.5 gap-0.5">
              <button
                type="button"
                onClick={() => setEditorTab("write")}
                className={`px-4 py-2 rounded-full transition-colors cursor-pointer ${
                  editorTab === "write"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setEditorTab("preview")}
                className={`px-4 py-2 rounded-full transition-colors cursor-pointer ${
                  editorTab === "preview"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
            <span className="text-xl font-medium text-muted-foreground">
              {editorTab === "write" ? "Content (Markdown)" : "Preview"}
            </span>
          </div>
          <div className="border-2 border-border rounded-xl">
            {editorTab === "write" ? (
              <textarea
                id="body"
                data-lenis-prevent
                className="w-full h-[500px] min-h-[200px] p-5 bg-background text-lg font-mono resize-y overflow-y-auto focus:outline-none rounded-xl"
                placeholder="Write your changelog in markdown."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            ) : (
              <div
                data-lenis-prevent
                className="h-[500px] min-h-[200px] p-5 prose prose-lg max-w-none overflow-y-auto resize-y"
              >
                {body ? (
                  <ReactMarkdown>{body}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground text-lg">
                    Nothing to preview yet...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* errors */}
        {error && <p className="text-lg text-red-500">{error}</p>}

        {/* buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            onClick={() => setStatus("draft")}
            className="h-12 px-8 text-base"
          >
            {loading ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            type="submit"
            variant="outline"
            size="lg"
            disabled={loading}
            onClick={() => setStatus("published")}
            className="h-12 px-8 text-base"
          >
            Publish
          </Button>

          <div className="h-6 w-px bg-border" />

          {!showSchedule ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => setShowSchedule(true)}
              className="h-12 px-6 text-base gap-2 text-muted-foreground"
            >
              <Calendar className="h-5 w-5" />
              Schedule
            </Button>
          ) : (
            <div className="flex flex-wrap gap-3 items-center">
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-auto h-12 text-base"
              />
              <Button
                type="submit"
                variant="outline"
                size="lg"
                disabled={loading || !scheduledAt}
                onClick={() => setStatus("scheduled")}
                className="h-12 px-8 text-base"
              >
                Schedule
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="default"
                onClick={() => {
                  setShowSchedule(false);
                  setScheduledAt("");
                }}
                className="h-12 text-base text-muted-foreground"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* delete button — pushed to the right */}
          <div className="sm:ml-auto">
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={handleDelete}
              className="h-12 px-8 text-base"
            >
              Delete
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
