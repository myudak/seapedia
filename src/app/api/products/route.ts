import { listCatalogProducts } from "@/lib/domain/state";
import { ok } from "@/lib/server/http";

export async function GET() {
  return ok(listCatalogProducts());
}
