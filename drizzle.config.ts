import { getDatabaseUrl } from "@/lib/db";
import { type Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: getDatabaseUrl() },
  tablesFilter: ["viewtube_*"],
} satisfies Config;
