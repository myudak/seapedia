"use client";

import { useState } from "react";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const SAMPLE = "<script>alert('xss')</script><img src=x onerror=alert(1)>";

type StoredReview = { reviewerName: string; comment: string };

export function XssReviewDemo() {
  const [payload, setPayload] = useState(SAMPLE);
  const [stored, setStored] = useState<StoredReview | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerName: "Security Probe",
          rating: 5,
          comment: payload,
        }),
      });
      const data = await response.json();
      if (data.ok) {
        setStored(data.data as StoredReview);
      } else {
        setError(data.error ?? "Request failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold">
        <span>Malicious input</span>
        <textarea
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          rows={2}
          className="min-h-11 rounded-[0.625rem] border border-[var(--line)] bg-white px-3.5 py-2.5 font-mono text-sm outline-none transition focus:border-[var(--danger)] focus:ring-4 focus:ring-[rgba(194,90,60,0.14)]"
        />
      </label>
      <Button
        type="button"
        onClick={submit}
        disabled={pending}
        icon={<TriangleAlert size={17} />}
      >
        {pending ? "Submitting…" : "Submit to /api/reviews"}
      </Button>

      {error ? (
        <p className="rounded-[0.625rem] bg-[rgba(194,90,60,0.1)] px-3.5 py-3 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {stored ? (
        <div className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--soft)]/40 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--market)]">
            <ShieldCheck size={16} />
            Stored safely — no script executed
          </p>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Server-stored value (HTML-escaped)
            </p>
            <pre className="mt-1.5 overflow-x-auto rounded-md bg-white p-3 font-mono text-xs text-[var(--ink)]">
              {stored.comment}
            </pre>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Rendered on the page
            </p>
            <p className="mt-1.5 rounded-md bg-white p-3 text-sm text-[var(--ink)]">
              “{stored.comment}”
            </p>
          </div>
          <p className="text-xs leading-5 text-[var(--muted)]">
            Convex validates and normalizes the payload in{" "}
            <code className="font-mono">convex/reviews.ts</code>. React then
            escapes the stored comment as a text node, so the browser never
            parses it as markup and the alert never fires.
          </p>
        </div>
      ) : null}
    </div>
  );
}
