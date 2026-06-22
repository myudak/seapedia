"use client";

import { useEffect, useState } from "react";
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
        if (mounted && payload.ok) {
          setReviews(payload.data);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6" id="reviews">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <h2 className="text-3xl font-black">Application Reviews</h2>
          <p className="mt-3 text-[var(--muted)]">
            Guests and logged-in users can review the website experience without
            checkout or transaction history.
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
            <Field label="Reviewer name">
              <TextInput
                value={reviewerName}
                onChange={(event) => setReviewerName(event.target.value)}
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
                    {value}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Comment">
              <TextInput
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                required
              />
            </Field>
            <Button icon={<MessageSquare size={18} />}>Submit review</Button>
          </form>
        </Card>

        <div className="grid gap-4">
          {reviews.map((review, index) => (
            <Card key={review.id ?? `${review.reviewerName}-${index}`} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black">{review.reviewerName}</h3>
                <span className="flex items-center gap-1 text-sm font-black text-[var(--gold)]">
                  <Star size={16} fill="currentColor" />
                  {review.rating}/5
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {review.comment}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
