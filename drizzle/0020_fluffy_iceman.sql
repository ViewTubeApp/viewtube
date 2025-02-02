ALTER TABLE "viewtube_category_x_video" ALTER COLUMN "category_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "viewtube_category_x_video" ALTER COLUMN "video_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "viewtube_category" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "viewtube_category" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "viewtube_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "viewtube_model_x_video" ALTER COLUMN "model_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "viewtube_model_x_video" ALTER COLUMN "video_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "viewtube_model" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "viewtube_model" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "viewtube_model_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "viewtube_tag" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "viewtube_tag" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "viewtube_tag_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "viewtube_video_x_tag" ALTER COLUMN "video_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "viewtube_video_x_tag" ALTER COLUMN "tag_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "viewtube_video" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "viewtube_video" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "viewtube_video_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "viewtube_video_task" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "viewtube_video_task" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "viewtube_video_task_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "viewtube_video_task" ALTER COLUMN "video_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "viewtube_model" ADD CONSTRAINT "viewtube_model_name_unique" UNIQUE("name");