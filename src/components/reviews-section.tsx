"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextInput } from "@/components/ui/field";

type Review = {
  id?: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt?: number;
};

const initialReviews: Review[] = [
  {
    reviewerName: "Dina",
    rating: 5,
    comment: "Role flow is clear, and the marketplace feels ready for launch.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    reviewerName: "Raka",
    rating: 4,
    comment: "Catalog is easy to scan even before logging in.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
];

const avatarTones = [
  "bg-[rgba(194,90,60,0.14)] text-[var(--danger)]",
  "bg-[rgba(31,111,106,0.14)] text-[var(--market)]",
  "bg-[rgba(184,134,46,0.16)] text-[#8a6d1f]",
  "bg-[rgba(90,60,194,0.12)] text-[#5a3cc2]",
  "bg-[rgba(60,120,194,0.12)] text-[#2a6bbf]",
];

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={size}
          fill={value <= rating ? "currentColor" : "none"}
          className={value <= rating ? "text-[var(--gold)]" : "text-[var(--line)]"}
        />
      ))}
    </span>
  );
}

function ClickableStars({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hovered || value) >= n;
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(n)}
            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--market)]"
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
          >
            <Star
              size={22}
              fill={active ? "currentColor" : "none"}
              className={active ? "text-[var(--gold)]" : "text-[var(--line)]"}
            />
          </button>
        );
      })}
    </span>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="flex w-7 shrink-0 items-center justify-end gap-0.5 text-xs text-[var(--muted)]">
        {star}
        <Star size={9} fill="currentColor" className="text-[var(--gold)]" />
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--soft)]">
        <div
          className="h-full rounded-full bg-[var(--gold)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-5 shrink-0 text-right text-xs text-[var(--muted)]">{count}</span>
    </div>
  );
}

function formatDate(ts?: number): string {
  if (!ts) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ts));
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((payload) => {
        if (mounted && payload.ok && payload.data?.length) setReviews(payload.data);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const { average, starCounts } = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    let total = 0;
    for (const r of reviews) {
      total += r.rating;
      if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
    }
    return {
      average: reviews.length ? total / reviews.length : 0,
      starCounts: counts,
    };
  }, [reviews]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewerName, rating, comment }),
    })
      .then((r) => r.json())
      .then((payload) => {
        if (payload.ok) {
          setReviews((curr) => [payload.data, ...curr]);
          setReviewerName("");
          setRating(5);
          setComment("");
        }
      })
      .catch(() => undefined)
      .finally(() => setSubmitting(false));
  }

  return (
    <section className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6" id="reviews">
      {/* ── Stat header ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl">
          <span className="inline-flex w-fit items-center rounded-full border border-[var(--line)] bg-[var(--soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Testimonials
          </span>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">
            What users are saying about SEAPEDIA
          </h2>
          <p className="mt-3 leading-7 text-[var(--muted)]">
            Honest feedback from buyers, sellers, and visitors — no transaction required.
          </p>
        </div>

        {/* Score card + distribution bars */}
        <Card className="w-full shrink-0 p-6 md:w-64">
          <div className="flex items-end gap-4">
            <p className="font-display text-5xl leading-none">{average.toFixed(1)}</p>
            <div className="pb-1">
              <Stars rating={Math.round(average)} size={16} />
              <p className="mt-1 text-xs text-[var(--muted)]">
                {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar
                key={star}
                star={star}
                count={starCounts[star - 1]}
                total={reviews.length}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* ── Review cards + inline form ── */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        {/* Cards grid */}
        <div className="grid auto-rows-min gap-4 sm:grid-cols-2">
          {reviews.map((review, index) => (
            <Card
              key={review.id ?? `${review.reviewerName}-${index}`}
              className="flex flex-col p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <Stars rating={review.rating} size={13} />
                {review.createdAt && (
                  <span className="shrink-0 text-xs text-[var(--muted)]">
                    {formatDate(review.createdAt)}
                  </span>
                )}
              </div>
              <p className="mt-3 flex-1 text-sm leading-7 text-[var(--ink)]">
                &ldquo;{review.comment}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-[var(--line)] pt-4">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                    avatarTones[index % avatarTones.length]
                  }`}
                >
                  {review.reviewerName.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">{review.reviewerName}</p>
                  <p className="text-xs text-[var(--muted)]">SEAPEDIA user</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Inline form */}
        <Card className="h-fit p-6 sm:p-8">
          <h3 className="font-display text-xl">Leave a review</h3>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Tell us about your experience using SEAPEDIA.
          </p>
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <Field label="Your name">
              <TextInput
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Dina"
                required
              />
            </Field>
            <Field label="Rating">
              <div className="pt-1">
                <ClickableStars value={rating} onChange={setRating} />
              </div>
            </Field>
            <Field label="Comment">
              <TextInput
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share what worked well"
                required
              />
            </Field>
            <Button icon={<MessageSquare size={18} />} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit review"}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
