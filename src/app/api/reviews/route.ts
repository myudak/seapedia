import { z } from "zod";
import { fail, ok } from "@/lib/server/http";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

const reviewSchema = z.object({
  reviewerName: z.string().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(500),
});

export async function GET() {
  return ok(await fetchQuery(api.reviews.list, {}));
}

export async function POST(request: Request) {
  const parsed = reviewSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid review payload.");
  }

  return ok(await fetchMutation(api.reviews.create, parsed.data), { status: 201 });
}
