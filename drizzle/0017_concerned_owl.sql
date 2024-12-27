ALTER TABLE "viewtube_category" RENAME COLUMN "name" TO "slug";--> statement-breakpoint
ALTER TABLE "viewtube_category" DROP CONSTRAINT "viewtube_category_name_unique";--> statement-breakpoint
DROP INDEX "category_name_idx";--> statement-breakpoint
CREATE INDEX "category_slug_idx" ON "viewtube_category" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "viewtube_category" ADD CONSTRAINT "viewtube_category_slug_unique" UNIQUE("slug");