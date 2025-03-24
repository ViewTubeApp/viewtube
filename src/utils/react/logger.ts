import { LogLevels, createConsola } from "consola";

export const logger = createConsola({
  level: LogLevels.debug,
  formatOptions: { colors: true },
});
