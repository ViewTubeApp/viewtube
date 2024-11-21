CREATE TABLE IF NOT EXISTS "viewtube_model_x_video" (
	"model_id" varchar NOT NULL,
	"video_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "viewtube_model" (
	"name" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "viewtube_tag" (
	"name" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "viewtube_video_x_tag" (
	"video_id" varchar NOT NULL,
	"tag_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "viewtube_video" (
	"title" text NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"length_seconds" integer DEFAULT 0 NOT NULL,
	"url" varchar NOT NULL,
	"id" varchar PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "viewtube_model_x_video" ADD CONSTRAINT "viewtube_model_x_video_model_id_viewtube_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."viewtube_model"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "viewtube_model_x_video" ADD CONSTRAINT "viewtube_model_x_video_video_id_viewtube_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."viewtube_video"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "viewtube_video_x_tag" ADD CONSTRAINT "viewtube_video_x_tag_video_id_viewtube_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."viewtube_video"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "viewtube_video_x_tag" ADD CONSTRAINT "viewtube_video_x_tag_tag_id_viewtube_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."viewtube_tag"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "model_video_idx" ON "viewtube_model_x_video" USING btree ("model_id","video_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "model_name_idx" ON "viewtube_model" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tag_name_idx" ON "viewtube_tag" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "video_tag_idx" ON "viewtube_video_x_tag" USING btree ("video_id","tag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "video_title_idx" ON "viewtube_video" USING btree ("title");