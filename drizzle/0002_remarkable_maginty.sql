ALTER TABLE "viewtube_model_x_video" ALTER COLUMN "model_id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "viewtube_model_x_video" ALTER COLUMN "video_id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "viewtube_model" ALTER COLUMN "name" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "viewtube_model" ALTER COLUMN "id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "viewtube_tag" ALTER COLUMN "name" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "viewtube_tag" ALTER COLUMN "id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "viewtube_video_x_tag" ALTER COLUMN "video_id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "viewtube_video_x_tag" ALTER COLUMN "tag_id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "viewtube_video" ALTER COLUMN "url" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "viewtube_video" ALTER COLUMN "thumbnail" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "viewtube_video" ALTER COLUMN "thumbnail" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "viewtube_video" ALTER COLUMN "id" SET DATA TYPE varchar(256);