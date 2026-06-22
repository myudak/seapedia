import { getSellerIncomeReport } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

export async function GET() {
  try {
    const profile = await requireActiveRole("Seller");
    return ok(getSellerIncomeReport(profile.user.id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Seller role required.", 403);
  }
}
