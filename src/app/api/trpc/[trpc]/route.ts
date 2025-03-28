import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import debug from "debug";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const log = debug("api:trpc");

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
  const cookie = await cookies();
  return createTRPCContext({ headers: req.headers, cookies: cookie });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    req,
    router: appRouter,
    endpoint: "/api/trpc",
    createContext: () => createContext(req),
    onError: ({ path, error }) => log(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`),
  });

export { handler as GET, handler as POST };
