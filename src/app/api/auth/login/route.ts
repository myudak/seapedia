import { NextResponse } from "next/server";
import { z } from "zod";
import { loginUser } from "@/lib/domain/state";
import { SESSION_COOKIE, SESSION_TTL_MS } from "@/lib/domain/types";
import { fail } from "@/lib/server/http";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());

  if (!parsed.success) {
    return fail("Invalid login payload.");
  }

  try {
    const { token, profile } = await loginUser(
      parsed.data.username,
      parsed.data.password,
    );
    const response = NextResponse.json({ ok: true, data: profile });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
      path: "/",
    });
    return response;
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Login failed.", 401);
  }
}
