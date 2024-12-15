CREATE TYPE "public"."task_type" AS ENUM('poster', 'webvtt', 'trailer');--> statement-breakpoint
CREATE TYPE "public"."video_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "viewtube_video_task" (
	"video_id" varchar(256) NOT NULL,
	"task_type" "task_type" NOT NULL,
	"status" "video_status" DEFAULT 'pending' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"error" text,
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "viewtube_video" ADD COLUMN "status" "video_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "viewtube_video" ADD COLUMN "processing_started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "viewtube_video" ADD COLUMN "processing_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "viewtube_video_task" ADD CONSTRAINT "viewtube_video_task_video_id_viewtube_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."viewtube_video"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "video_task_idx" ON "viewtube_video_task" USING btree ("video_id","task_type");--> statement-breakpoint
CREATE INDEX "video_task_status_idx" ON "viewtube_video_task" USING btree ("status");--> statement-breakpoint
ALTER TABLE "viewtube_video" DROP COLUMN "processed";