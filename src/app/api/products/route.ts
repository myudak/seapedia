import { getCatalogPage, parseCatalogPage, parseCatalogSort, parseCategory } from "@/lib/catalog/server";
import { ok } from "@/lib/server/http";

export async function GET(request: Request) {
  const search = new URL(request.url).searchParams;
  const data = await getCatalogPage({
    q: search.get("q")?.trim() || undefined,
    category: parseCategory(search.get("category") ?? undefined),
    page: parseCatalogPage(search.get("page") ?? undefined),
    sort: parseCatalogSort(search.get("sort") ?? undefined),
  });
  return ok(data);
}
