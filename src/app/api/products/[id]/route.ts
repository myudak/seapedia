import { getCatalogProduct } from "@/lib/catalog/server";
import { fail, ok } from "@/lib/server/http";

type ProductRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: ProductRouteProps) {
  const { id } = await params;
  const product = await getCatalogProduct(id);

  if (!product) {
    return fail("Product not found.", 404);
  }

  return ok(product);
}
