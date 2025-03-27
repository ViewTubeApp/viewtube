import { env } from "@/env";
import { createRouteHandler } from "uploadthing/next";
import { type RouteHandlerConfig } from "uploadthing/types";

import { router } from "./core";

const config: RouteHandlerConfig = {
  isDev: env.NODE_ENV === "development",
};

export const { GET, POST } = createRouteHandler({
  router,
  config,
});
