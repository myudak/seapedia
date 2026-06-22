import { listAvailableDeliveryJobs } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

export async function GET() {
  try {
    await requireActiveRole("Driver");
    return ok(listAvailableDeliveryJobs());
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Driver role required.", 403);
  }
}
