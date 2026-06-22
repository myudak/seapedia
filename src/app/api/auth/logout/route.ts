import { NextResponse } from "next/server";
import { logoutToken } from "@/lib/domain/state";
import { SESSION_COOKIE } from "@/lib/domain/types";
import { readSessionToken } from "@/lib/server/session";

export async function POST() {
  const token = await readSessionToken();
  logoutToken(token);

  const response = NextResponse.json({ ok: true, data: { loggedOut: true } });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
