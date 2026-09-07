import { NextResponse } from "next/server";
import { AUTH_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/constants";
import { signInSchema } from "@/lib/auth/schema";
import { createSessionToken, validateDemoCredentials } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = signInSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  if (!validateDemoCredentials(result.data.email, result.data.password)) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, createSessionToken(result.data.email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
