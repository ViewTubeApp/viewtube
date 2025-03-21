"use client";

import { Link } from "@/i18n/navigation";
import { getPublicURL } from "@/utils/react/video";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { forwardRef } from "react";

import { type CategoryListElement } from "@/server/api/routers/categories";

import { NiceImage } from "@/components/nice-image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryCardProps {
  category: CategoryListElement;
}

export const CategoryCard = forwardRef<HTMLDivElement, CategoryCardProps>(({ category }, ref) => {
  const t = useTranslations();

  return (
    <Link href={{ pathname: "/videos", query: { c: category.id } }}>
      <motion.div ref={ref} whileHover={{ scale: 1.02 }}>
        <Card className="p-0 cursor-pointer">
          <CardContent className="p-0 flex relative rounded-xl aspect-video overflow-hidden">
            <NiceImage
              fill
              style={{ objectFit: "cover" }}
              loading="lazy"
              imageClassName="brightness-50"
              src={getPublicURL(category.imageUrl).forType("file")}
              alt={category.slug}
            />

            <CardHeader className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur">
              <CardTitle>{category.slug}</CardTitle>
              <CardDescription>
                {t.rich("assigned_videos_count", {
                  count: category.assignedVideosCount,
                  strong: (chunks) => <span className="text-primary font-bold">{chunks}</span>,
                })}
              </CardDescription>
            </CardHeader>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
});

CategoryCard.displayName = "CategoryCard";
