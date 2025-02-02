"use client";

import * as m from "@/paraglide/messages";
import { getPublicURL } from "@/utils/react/video";
import { motion } from "motion/react";
import { forwardRef } from "react";

import { type CategoryResponse } from "@/server/api/routers/categories";

import { Link } from "@/lib/i18n";

import { NiceImage } from "@/components/nice-image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryCardProps {
  category: CategoryResponse;
}

export const CategoryCard = forwardRef<HTMLDivElement, CategoryCardProps>(({ category }, ref) => {
  return (
    <Link href={{ pathname: "/videos", query: { c: category.id } }}>
      <motion.div ref={ref} whileHover={{ scale: 1.02 }}>
        <Card className="cursor-pointer">
          <CardContent className="p-0 relative aspect-video overflow-hidden rounded-lg">
            <NiceImage
              fill
              style={{ objectFit: "cover" }}
              loading="lazy"
              className="rounded-lg brightness-50"
              src={getPublicURL(category.imageUrl).forType("file")}
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
});

CategoryCard.displayName = "CategoryCard";
