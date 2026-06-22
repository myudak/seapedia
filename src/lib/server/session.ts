import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/domain/types";

export async function readSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}
