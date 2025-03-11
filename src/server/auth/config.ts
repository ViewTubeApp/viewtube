import { env } from "@/env";
import type { NextAuthConfig } from "next-auth";
import Authentik from "next-auth/providers/authentik";

export default {
  secret: env.AUTHENTIK_SECRET_KEY,

  callbacks: {
    authorized: async ({ auth }) => {
      // Skip auth in development
      if (env.NODE_ENV === "development") return true;
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
  },

  providers: [
    Authentik({
      issuer: env.AUTHENTIK_AUTH_ISSUER,
      clientId: env.AUTHENTIK_AUTH_CLIENT_ID,
      clientSecret: env.AUTHENTIK_AUTH_CLIENT_SECRET,
    }),
  ],
} satisfies NextAuthConfig;
