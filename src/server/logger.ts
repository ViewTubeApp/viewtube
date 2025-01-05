import { env } from "@/env";
import { type ConsolaInstance, LogLevels, createConsola } from "consola";

const context = globalThis as unknown as {
  logger: ConsolaInstance | undefined;
};

const logger =
  context.logger ??
  createConsola({
    level: LogLevels.debug,
    formatOptions: { colors: true, columns: 120 },
  });

if (env.NODE_ENV !== "production") context.logger = logger;

export const log = logger;
