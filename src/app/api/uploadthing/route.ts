import { env } from "@/env";
import { createRouteHandler } from "uploadthing/next";
import { type RouteHandlerConfig } from "uploadthing/types";

import { router } from "./core";

const config: RouteHandlerConfig = {
  logLevel: "Error",
  token: env.UPLOADTHING_TOKEN,
  isDev: env.NODE_ENV === "development",
};

export const { GET, POST } = createRouteHandler({
  router,
  config,
});
