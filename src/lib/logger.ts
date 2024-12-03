import { env } from "@/env";
import pino, { type Logger } from "pino";
import { match } from "ts-pattern";

const context = globalThis as unknown as {
  logger: Logger | undefined;
};

function createLogger() {
  const logger =
    context.logger ??
    match(env.NODE_ENV)
      .with("development", () =>
        pino({
          level: "debug",
          transport: {
            target: "pino-pretty",
            options: { colorize: true },
          },
        }),
      )
      .otherwise(() => pino({ level: "warn" }));
  if (env.NODE_ENV !== "production") context.logger = logger;
  return logger;
}

export const log = createLogger();
