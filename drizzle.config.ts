import { env } from "@/env";
import debug from "debug";
import { defineConfig } from "drizzle-kit";

debug("drizzle:config")(env);

export default defineConfig({
  schema: "./src/server/db/schema",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
});
