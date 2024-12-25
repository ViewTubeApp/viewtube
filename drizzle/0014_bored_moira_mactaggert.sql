CREATE TABLE "viewtube_category" (
	"name" varchar(256) NOT NULL,
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "viewtube_category_x_video" (
	"category_id" varchar(256) NOT NULL,
	"video_id" varchar(256) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "viewtube_category_x_video" ADD CONSTRAINT "viewtube_category_x_video_category_id_viewtube_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."viewtube_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viewtube_category_x_video" ADD CONSTRAINT "viewtube_category_x_video_video_id_viewtube_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."viewtube_video"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_video_idx" ON "viewtube_category_x_video" USING btree ("category_id","video_id");