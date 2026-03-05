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
  const [showSchedule, setShowSchedule] = useState(false);

  // header image
  const [headerImage, setHeaderImage] = useState<string | null>(null);

  // editor/preview toggle
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");

  // previous version — shown as a hint next to the version input
  const [previousVersion, setPreviousVersion] = useState<string | null>(null);

  // fetching available tags and latest version when page loads
  useEffect(() => {
    async function fetchData() {
      const [tagsRes, versionRes] = await Promise.all([
        fetch(`/api/tags?projectId=${projectId}`),
        fetch(`/api/entries/latest-version?projectId=${projectId}`),
      ]);

      if (tagsRes.ok) {
        const data = await tagsRes.json();
        setAvailableTags(data.tags);
      }

      if (versionRes.ok) {
        const data = await versionRes.json();
        if (data.version) setPreviousVersion(data.version);
      }
    }
    fetchData();
  }, [projectId]);

  // toggle for a tag - on/off (max 4)
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
        headerImage,
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        href={`/dashboard/${projectId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground
 hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to project
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mb-8">
      New Changelog Entry
      </h1>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* title + version — title gets more space */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-5">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-base font-medium"
            >
              Title
            </Label>
            <Input
              id="title"
              placeholder="What changed?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-10 text-sm"
              />
          </div>
          <div className="space-y-3">
            <Label htmlFor="version" className="text-base font-medium"
            >
              Version
            </Label>
            <Input
              id="version"
              placeholder="1.0.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              required
              className="h-10 text-sm"
              />
            {previousVersion && (
              <p className="text-sm text-muted-foreground">
                Previous:{" "}
                <span className="font-medium">v{previousVersion}</span>
              </p>
            )}
          </div>
        </div>

        {/* tags section */}
        <div className="space-y-4">
          <Label className="text-base font-medium"
          >Tags</Label>

          {/* existing tags — click to toggle, hover to show delete */}
          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {availableTags.map((tag) => (
                <div key={tag.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`text-sm font-bold px-3 py-1 rounded-full
 transition-all cursor-pointer uppercase ${
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
                    className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-foreground/80 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-foreground"
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
              className="w-52 h-9 text-sm"
              />
            {/* preset color swatches */}
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewTagColor(c.value)}
                  className="size-6 rounded-full cursor-pointer transition-all border-2"
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
              className="h-9 px-4 text-sm gap-1.5"
              >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {/* header image */}
        <div className="space-y-4">
          <Label className="text-base font-medium"
          >
            Header Image (optional)
          </Label>
          <ImageUploadField onImageChange={(url) => setHeaderImage(url)} />
        </div>

        {/* markdown editor and preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex bg-muted rounded-full p-1.5 gap-0.5">
              <button
                type="button"
                onClick={() => setEditorTab("write")}
                className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                  editorTab === "write"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
                className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                  editorTab === "preview"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
            <span className="text-base font-medium text-muted-foreground"
            >
              {editorTab === "write" ? "Content (Markdown)" : "Preview"}
            </span>
          </div>
          <div className="border-2 border-border rounded-xl">
            {editorTab === "write" ? (
              <textarea
                id="body"
                data-lenis-prevent
                className="w-full h-[450px] min-h-[200px] p-4 bg-background text-sm font-mono resize-y overflow-y-auto focus:outline-none rounded-xl"
                placeholder="Write your changelog in markdown..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            ) : (
              <div
                data-lenis-prevent
                className="h-[450px] min-h-[200px] p-4 prose prose-sm
 max-w-none overflow-y-auto resize-y"
              >
                {body ? (
                  <ReactMarkdown>{body}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground text-sm"
>
                    Nothing to preview yet...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-500"
          >{error}</p>}

        {/* buttons */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            onClick={() => setStatus("draft")}
            className="h-10 px-5 text-sm"
            >
            {loading ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            type="submit"
            variant="outline"
            size="lg"
            disabled={loading}
            onClick={() => setStatus("published")}
            className="h-10 px-5 text-sm"
            >
            Publish Now
          </Button>

          <div className="h-6 w-px bg-border" />

          {!showSchedule ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => setShowSchedule(true)}
              className="h-10 px-4 text-sm gap-2 text-muted-foreground"
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
                className="w-auto h-10 text-sm"
                />
              <Button
                type="submit"
                variant="outline"
                size="lg"
                disabled={loading || !scheduledAt}
                onClick={() => setStatus("scheduled")}
                className="h-10 px-5 text-sm"
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
                className="h-10 text-sm text-muted-foreground"
                >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </form>
    </motion.div>
  );
}
