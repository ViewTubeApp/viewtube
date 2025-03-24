import { type formats } from "@/i18n/request";
import { type routing } from "@/i18n/routing";
import { type TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import";

import type en from "../messages/en.json";

type MessageKeys = keyof typeof en;

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof en;
    Formats: typeof formats;
    Locale: (typeof routing.locales)[number];
  }
}

declare module "@trpc/client" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TRPCClientErrorLike<TRouter> {
    message: MessageKeys;
  }
}

declare module "@trpc/server" {
  interface ErrorShape {
    message: MessageKeys;
  }

  // More specific augmentation for the TRPCError constructor
  class TRPCError {
    constructor(opts: { message: MessageKeys; code: TRPC_ERROR_CODE_KEY; cause?: unknown });
  }
}
