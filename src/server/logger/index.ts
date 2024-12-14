import pino, { type Logger } from "pino";
import { env } from "@/env";

const context = globalThis as unknown as {
  logger: Logger | undefined;
};

const logger =
  context.logger ??
  pino({
    level: "debug",
    transport: {
      target: "pino-pretty",
      options: { colorize: true },
    },
  });

if (env.NODE_ENV !== "production") context.logger = logger;

export const log = logger;
