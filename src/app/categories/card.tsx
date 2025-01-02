"use client";

import * as m from "@/paraglide/messages";
import { getClientVideoUrls } from "@/utils/react/video";
import { motion } from "motion/react";
import { type FC } from "react";

import { type CategoryResponse } from "@/server/api/routers/categories";

import { Link } from "@/lib/i18n";

import { NiceImage } from "@/components/nice-image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryCardProps {
  category: CategoryResponse;
}

export const CategoryCard: FC<CategoryCardProps> = ({ category }) => {
  const { getVideoFileUrl } = getClientVideoUrls();

  return (
    <Link href={`/category/${category.slug}`}>
      <motion.div whileHover={{ scale: 1.02 }}>
        <Card className="cursor-pointer">
          <CardContent className="p-0 relative aspect-video overflow-hidden">
            <NiceImage
              className="rounded-lg brightness-50"
              priority
              fill
              src={getVideoFileUrl(category.imageUrl)}
              alt={category.slug}
            />

            <CardHeader className="absolute bottom-0 left-0 right-0 p-4">
              <CardTitle>{category.slug}</CardTitle>
              <CardDescription>{m.assigned_videos_count({ count: category.assignedVideosCount })}</CardDescription>
            </CardHeader>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};
