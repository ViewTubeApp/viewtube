import type { NextAuthConfig } from "next-auth";
import Authentik from "next-auth/providers/authentik";

export default {
  debug: true,
  secret: process.env.AUTHENTIK_SECRET_KEY,

  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
  },

  providers: [
    Authentik({
      checks: ["nonce"],
      issuer: process.env.AUTHENTIK_AUTH_ISSUER,
      clientId: process.env.AUTHENTIK_AUTH_CLIENT_ID,
      clientSecret: process.env.AUTHENTIK_AUTH_CLIENT_SECRET,
    }),
  ],
} satisfies NextAuthConfig;
