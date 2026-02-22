"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SubscribeForm({ projectId }: { projectId: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  // status has 4 possible values:

  // idle = form is ready, nothing happening
  // loading = request in progress
  // success = subscribed successfully
  // error = something went wrong

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

  // after subscription, showing a confirmation instead of the form. no need to subscribe again
  if (status === "success") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm font-medium text-green-600 dark:text-green-400">{message}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={status === "loading"} size="default">
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
      {status === "error" && (
        <p className="text-sm text-destructive mt-2">{message}</p>
      )}
    </div>
  );
}
