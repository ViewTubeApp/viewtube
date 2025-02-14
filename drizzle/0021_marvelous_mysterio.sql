CREATE TABLE "viewtube_comments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "viewtube_comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"content" text NOT NULL,
	"username" varchar(256) NOT NULL,
	"video_id" integer NOT NULL,
	"parent_id" integer
);
--> statement-breakpoint
ALTER TABLE "viewtube_comments" ADD CONSTRAINT "viewtube_comments_video_id_viewtube_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."viewtube_video"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comment_video_idx" ON "viewtube_comments" USING btree ("video_id");--> statement-breakpoint
CREATE INDEX "comment_parent_idx" ON "viewtube_comments" USING btree ("parent_id");