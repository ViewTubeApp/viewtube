import { env } from "@/env";
import Dexie, { type EntityTable } from "dexie";

export interface StoredRun {
  videoId: number;
  runId: string;
  publicAccessToken: string;
}

type DB = Dexie & {
  runs: EntityTable<StoredRun, "runId">;
};

export const db = new Dexie(env.NEXT_PUBLIC_BRAND) as DB;

db.version(1).stores({
  runs: "++runId, videoId, publicAccessToken",
});
