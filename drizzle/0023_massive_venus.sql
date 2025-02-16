CREATE TYPE "public"."vote_type" AS ENUM('like', 'dislike');--> statement-breakpoint
CREATE TABLE "viewtube_video_votes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "viewtube_video_votes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"video_id" integer,
	"vote_type" "vote_type" NOT NULL,
	"session_id" varchar(256) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "viewtube_video_votes" ADD CONSTRAINT "viewtube_video_votes_video_id_viewtube_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."viewtube_video"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "video_vote_idx" ON "viewtube_video_votes" USING btree ("video_id","session_id");--> statement-breakpoint
CREATE INDEX "video_vote_type_idx" ON "viewtube_video_votes" USING btree ("video_id","vote_type");--> statement-breakpoint
ALTER TABLE "viewtube_video" DROP COLUMN "likes_count";--> statement-breakpoint
ALTER TABLE "viewtube_video" DROP COLUMN "dislikes_count";