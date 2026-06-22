import { getBuyerSpendingReport } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

export async function GET() {
  try {
    const profile = await requireActiveRole("Buyer");
    return ok(getBuyerSpendingReport(profile.user.id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Buyer role required.", 403);
  }
}
