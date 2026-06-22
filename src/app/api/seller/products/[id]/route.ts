import { z } from "zod";
import { deleteSellerProduct, updateSellerProduct } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

type ProductRouteProps = {
  params: Promise<{ id: string }>;
};

const productPatchSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(8).max(500).optional(),
  price: z.number().int().positive().optional(),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.url().optional(),
});

export async function PATCH(request: Request, { params }: ProductRouteProps) {
  const parsed = productPatchSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid product payload.");
  }

  try {
    const profile = await requireActiveRole("Seller");
    const { id } = await params;
    return ok(updateSellerProduct(profile.user.id, id, parsed.data));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Product update failed.", 403);
  }
}

export async function DELETE(_request: Request, { params }: ProductRouteProps) {
  try {
    const profile = await requireActiveRole("Seller");
    const { id } = await params;
    return ok(deleteSellerProduct(profile.user.id, id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Product delete failed.", 403);
  }
}
