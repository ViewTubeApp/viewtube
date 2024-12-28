import { env } from "@/env";
import type { NextAuthConfig } from "next-auth";
import Authentik from "next-auth/providers/authentik";

import { log as globalLog } from "@/server/logger";

export default {
  secret: process.env.AUTHENTIK_SECRET_KEY,

  logger: {
    error(code, ...message) {
      const log = globalLog.withTag("auth/config");
      log.error(code, ...message);
    },
    warn(code, ...message) {
      const log = globalLog.withTag("auth/config");
      log.warn(code, ...message);
    },
    debug(code, ...message) {
      const log = globalLog.withTag("auth/config");
      log.debug(code, ...message);
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
