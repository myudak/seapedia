import { takeDeliveryJob } from "@/lib/domain/state";
import { fail, ok } from "@/lib/server/http";
import { requireActiveRole } from "@/lib/server/auth";

type TakeJobRouteProps = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: TakeJobRouteProps) {
  try {
    const profile = await requireActiveRole("Driver");
    const { id } = await params;
    return ok(takeDeliveryJob(profile.user.id, id));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Take job failed.", 403);
  }
}
