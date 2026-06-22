import { getDeliveryJob } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

type DriverJobRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: DriverJobRouteProps) {
  try {
    await requireActiveRole("Driver");
    const { id } = await params;
    const job = getDeliveryJob(id);

    if (!job) {
      return fail("Delivery job not found.", 404);
    }

    return ok(job);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Driver role required.", 403);
  }
}
