import { ffmpeg } from "@trigger.dev/build/extensions/core";
import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_ebqraseupzupmfpyjxhj",
  runtime: "node",
  logLevel: "debug",
  maxDuration: 10 * 60, // 10 minutes
  dirs: ["src/server/trigger"],
  build: { extensions: [ffmpeg()], external: ["fluent-ffmpeg"] },
});
