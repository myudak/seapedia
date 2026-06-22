import { z } from "zod";
import { createSellerProduct, listSellerProducts } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

const productSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(8).max(500),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
  imageUrl: z.url().optional().or(z.literal("")),
});

export async function GET() {
  try {
    const profile = await requireActiveRole("Seller");
    return ok(listSellerProducts(profile.user.id));
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
    const profile = await requireActiveRole("Seller");
    return ok(createSellerProduct(profile.user.id, parsed.data), { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Product creation failed.");
  }
}
