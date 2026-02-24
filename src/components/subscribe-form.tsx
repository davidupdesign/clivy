"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function SubscribeForm({ projectId }: { projectId: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const response = await fetch("/api/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, projectId }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error);
      return;
    }

    setStatus("success");
    setMessage("You're subscribed! We'll notify you of new updates.");
    setEmail("");
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-4 py-2">
        <Check className="h-4 w-4 text-green-600" />
        <p className="text-sm text-green-700">{message}</p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-lg">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 h-11 text-base"
        />
        <Button type="submit" disabled={status === "loading"} className="h-11 px-6 text-base">
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
      {status === "error" && (
        <p className="text-sm text-destructive mt-2">{message}</p>
      )}
    </div>
  );
}
