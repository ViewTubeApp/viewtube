ALTER TABLE "viewtube_video" ADD COLUMN "likes_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "viewtube_video" ADD COLUMN "dislikes_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "viewtube_video" ADD COLUMN "video_length" integer DEFAULT 0 NOT NULL;