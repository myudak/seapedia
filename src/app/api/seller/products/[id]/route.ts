import { z } from "zod";
import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "../../../../../../convex/_generated/api";

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
    const { id } = await params;
    return ok(await fetchAuthMutation(api.seller.updateProduct, { publicId: id, ...parsed.data }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Product update failed.", 403);
  }
}

export async function DELETE(_request: Request, { params }: ProductRouteProps) {
  try {
    const { id } = await params;
    return ok(await fetchAuthMutation(api.seller.deleteProduct, { publicId: id }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Product delete failed.", 403);
  }
}
