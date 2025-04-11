import { env } from "@/env";
import { type NextRequest, type NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "NEXT_SESSION_ID";

export async function checkAnonymousSession(req: NextRequest, res: NextResponse) {
  if (!req.cookies.get(SESSION_COOKIE_NAME)) {
    const session = crypto.randomUUID();
    res.cookies.set(SESSION_COOKIE_NAME, session, {
      path: "/",
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return req.cookies.get(SESSION_COOKIE_NAME)?.value;
}
