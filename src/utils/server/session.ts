import { env } from "@/env";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "NEXT_SESSION_ID";

export async function checkAnonymousSession() {
  const cookie = await cookies();

  if (!cookie.get(SESSION_COOKIE_NAME)) {
    const session = crypto.randomUUID();
    cookie.set(SESSION_COOKIE_NAME, session, {
      path: "/",
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return cookie.get(SESSION_COOKIE_NAME)?.value;
}
