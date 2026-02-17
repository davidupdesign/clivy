"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, version, status, projectId }),
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
      <h1 className="text-3xl font-bold mb-8">New Changelod Entry</h1>
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

        {/* markdown editor and preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* editor */}
          <div className="space-y-2">
            <Label htmlFor="body">Content (Markdown)</Label>
            <textarea
              id="body"
              className="w-full min-h-[400px] p-3 border rounded-md bg-background text-sm font-mono resize-y"
              placeholder="Write your changelod in markdown."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          {/* live preview */}
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

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            onClick={() => setStatus("draft")}
          >
            {loading ? "Saving..." : "Save Draft"}
          </Button>

          <Button
            type="submit"
            variant="outline"
            disabled={loading}
            onClick={() => setStatus("published")}
          >
            Publish
          </Button>
        </div>
      </form>
    </div>
  );
}
