import { fail, ok } from "@/lib/server/http";
import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";

type TakeJobRouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: TakeJobRouteProps) {
  try {
    const { id } = await params;
    return ok(await fetchAuthMutation(api.orders.takeJob, { jobId: id as Id<"deliveryJobs"> }));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Take job failed.", 403);
  }
}
