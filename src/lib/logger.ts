import { LogLevels, createConsola } from "consola";

export const log = createConsola({
  level: LogLevels.debug,
  formatOptions: { colors: true },
});
