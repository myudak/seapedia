import { z } from "zod";
import { createAppReview, listAppReviews } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";

const reviewSchema = z.object({
  reviewerName: z.string().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(500),
});

export async function GET() {
  return ok(listAppReviews());
}

export async function POST(request: Request) {
  const parsed = reviewSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid review payload.");
  }

  return ok(createAppReview(parsed.data), { status: 201 });
}
