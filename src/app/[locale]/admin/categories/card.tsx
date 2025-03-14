"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import { getPublicURL } from "@/utils/react/video";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { type FC } from "react";

import { type CategoryListElement } from "@/server/api/routers/categories";

import { motions } from "@/constants/motion";

import { NiceImage } from "@/components/nice-image";
import { Card } from "@/components/ui/card";

import { CategoryRowActions } from "./actions";

interface CategoryCardProps {
  item: CategoryListElement;
}

export const CategoryCard: FC<CategoryCardProps> = ({ item: category }) => {
  const t = useTranslations();
  const formattedDistance = useFormattedDistance();

  return (
    <motion.div {...motions.slide.y.in}>
      <Card className="isolate gap-2 relative p-0 pb-4">
        <div className="flex overflow-hidden rounded-xg rounded-b-none relative aspect-video w-full">
          <NiceImage
            fill
            style={{ objectFit: "cover" }}
            loading="lazy"
            className="rounded-lg brightness-50"
            src={getPublicURL(category.imageUrl).forType("file")}
            alt={category.slug}
          />
        </div>
        <div className="flex flex-col px-2 gap-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{category.slug}</h3>
            <CategoryRowActions category={category} />
          </div>

          <p className="text-sm text-muted-foreground">
            {t("assigned_videos_count", { count: category.assignedVideosCount })}
          </p>

          <p className="text-sm text-muted-foreground ml-auto">
            {t("created_at", { date: formattedDistance(category.createdAt) })}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
