import { fail, ok } from "@/lib/server/http";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

type DriverJobRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: DriverJobRouteProps) {
  try {
    const { id } = await params;
    const job = await fetchAuthQuery(api.orders.getJob, { jobId: id as Id<"deliveryJobs"> });

    if (!job) {
      return fail("Delivery job not found.", 404);
    }

    return ok(job);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Driver role required.", 403);
  }
}
