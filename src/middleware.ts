import NextAuth from "next-auth";
import authConfig from "@/lib/auth/config";

export const config = {
  matcher: ["/admin/:path*"],
};

export const { auth: middleware } = NextAuth(authConfig);
