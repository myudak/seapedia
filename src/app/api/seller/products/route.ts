import { z } from "zod";
import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../convex/_generated/api";

const productSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(8).max(500),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
  imageUrl: z.url().optional().or(z.literal("")),
});

export async function GET() {
  try {
    return ok(await fetchAuthQuery(api.seller.listProducts, {}));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Seller role required.", 403);
  }
}

export async function POST(request: Request) {
  const parsed = productSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid product payload.");
  }

  try {
    return ok(await fetchAuthMutation(api.seller.createProduct, parsed.data), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Product creation failed.");
  }
}
