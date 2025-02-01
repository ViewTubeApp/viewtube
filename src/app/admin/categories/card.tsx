import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import * as m from "@/paraglide/messages";
import { getPublicURL } from "@/utils/react/video";
import { motion } from "motion/react";
import { type FC } from "react";

import { type CategoryResponse } from "@/server/api/routers/categories";

import { motions } from "@/constants/motion";

import { NiceImage } from "@/components/nice-image";
import { Card } from "@/components/ui/card";

import { CategoryRowActions } from "./actions";

interface CategoryCardProps {
  item: CategoryResponse;
}

export const CategoryCard: FC<CategoryCardProps> = ({ item: category }) => {
  const formattedDistance = useFormattedDistance();

  return (
    <motion.div {...motions.slide.y.in}>
      <Card className="transition-colors hover:bg-muted/50 isolate relative space-y-4">
        <div className="overflow-hidden rounded-lg rounded-b-none relative aspect-video w-full">
          <NiceImage
            fill
            style={{ objectFit: "cover" }}
            loading="lazy"
            className="rounded-lg brightness-50"
            src={getPublicURL(category.imageUrl).forType("file")}
            alt={category.slug}
          />
        </div>
        <div className="flex flex-col p-4 pt-0 gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{category.slug}</h3>
            <CategoryRowActions category={category} />
          </div>

          <p className="text-sm text-muted-foreground">
            {m.assigned_videos_count({ count: category.assignedVideosCount })}
          </p>

          <p className="text-sm text-muted-foreground ml-auto">
            {m.created_at({ date: formattedDistance(category.createdAt) })}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
