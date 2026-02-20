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
    return <p className="text-sm text-green-600">{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="max-w-xs"
      />
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </Button>
      {status === "error" && (
        <p className="text-sm text-red-500 self-center">{message}</p>
      )}
    </form>
  );
}
