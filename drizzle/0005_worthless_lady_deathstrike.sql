ALTER TABLE "viewtube_video" ADD COLUMN "processed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "viewtube_video" DROP COLUMN IF EXISTS "length_seconds";