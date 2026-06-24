"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, SelectInput, TextInput } from "@/components/ui/field";

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
  },
  {
    reviewerName: "Raka",
    rating: 4,
    comment: "Catalog is easy to scan even before logging in.",
  },
];

const avatarTones = [
  "bg-[rgba(194,90,60,0.14)] text-[var(--danger)]",
  "bg-[rgba(31,111,106,0.14)] text-[var(--market)]",
  "bg-[rgba(184,134,46,0.16)] text-[#8a6d1f]",
];

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={size}
          fill={value <= rating ? "currentColor" : "none"}
          className={
            value <= rating ? "text-[var(--gold)]" : "text-[var(--line)]"
          }
        />
      ))}
    </span>
  );
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState(initialReviews);
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    let mounted = true;

    fetch("/api/reviews")
      .then((response) => response.json())
      .then((payload) => {
        if (mounted && payload.ok && payload.data?.length) {
          setReviews(payload.data);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const average = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  return (
    <section className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6" id="reviews">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="inline-flex w-fit items-center rounded-full border border-[var(--line)] bg-[var(--soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            Testimonials
          </span>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">
            What people say about SEAPEDIA
          </h2>
          <p className="mt-3 max-w-xl leading-7 text-[var(--muted)]">
            Guests and logged-in users can review the website experience —
            no checkout or transaction history required.
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-4">
          <p className="font-display text-4xl leading-none">
            {average.toFixed(1)}
          </p>
          <div>
            <Stars rating={Math.round(average)} size={16} />
            <p className="mt-1 text-xs text-[var(--muted)]">
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="h-fit p-6 sm:p-8">
          <h3 className="font-display text-xl">Leave a review</h3>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Tell us about your experience using SEAPEDIA.
          </p>
          <form
            className="mt-6 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewerName, rating, comment }),
              })
                .then((response) => response.json())
                .then((payload) => {
                  if (payload.ok) {
                    setReviews((current) => [payload.data, ...current]);
                    setReviewerName("");
                    setRating(5);
                    setComment("");
                  }
                })
                .catch(() => undefined);
            }}
          >
            <Field label="Your name">
              <TextInput
                value={reviewerName}
                onChange={(event) => setReviewerName(event.target.value)}
                placeholder="e.g. Dina"
                required
              />
            </Field>
            <Field label="Rating">
              <SelectInput
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} star{value === 1 ? "" : "s"}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Comment">
              <TextInput
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share what worked well"
                required
              />
            </Field>
            <Button icon={<MessageSquare size={18} />}>Submit review</Button>
          </form>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((review, index) => (
            <Card
              key={review.id ?? `${review.reviewerName}-${index}`}
              className="flex flex-col p-5"
            >
              <Stars rating={review.rating} />
              <p className="mt-3 flex-1 leading-7 text-[var(--ink)]">
                “{review.comment}”
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-[var(--line)] pt-4">
                <span
                  className={`grid size-9 place-items-center rounded-full text-sm font-semibold ${
                    avatarTones[index % avatarTones.length]
                  }`}
                >
                  {review.reviewerName.trim().charAt(0).toUpperCase() || "?"}
                </span>
                <span className="text-sm font-semibold">
                  {review.reviewerName}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
