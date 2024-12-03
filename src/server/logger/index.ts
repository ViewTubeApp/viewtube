import { env } from "@/env";
import pino, { type Logger } from "pino";

const context = globalThis as unknown as {
  logger: Logger | undefined;
};

function createLogger() {
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
  return logger;
}

export const log = createLogger();
