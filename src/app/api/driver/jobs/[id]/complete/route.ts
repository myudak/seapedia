import { completeDeliveryJob } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

type CompleteJobRouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: CompleteJobRouteProps) {
  try {
    const profile = await requireActiveRole("Driver");
    const { id } = await params;
    return ok(completeDeliveryJob(profile.user.id, id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Complete job failed.", 403);
  }
}
