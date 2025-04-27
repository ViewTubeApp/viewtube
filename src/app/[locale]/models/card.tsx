"use client";

import { Link } from "@/i18n/navigation";
import { getPublicURL } from "@/utils/react/video";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { forwardRef } from "react";
import { LazyLoadComponent } from "react-lazy-load-image-component";

import { type ModelListElement } from "@/server/api/routers/models";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "@/components/ui/image";

interface ModelCardProps {
  model: ModelListElement;
}

export const ModelCard = forwardRef<HTMLDivElement, ModelCardProps>(({ model }, ref) => {
  const t = useTranslations();

  return (
    <Link href={{ pathname: "/videos", query: { m: model.id } }} prefetch>
      <motion.div ref={ref} whileHover={{ scale: 1.02 }}>
        <Card className="cursor-pointer p-0">
          <CardContent className="p-0 flex relative rounded-xl aspect-video overflow-hidden">
            <LazyLoadComponent>
              <Image
                fill
                loading="lazy"
                className="brightness-50 object-cover"
                src={getPublicURL(model.file_key)}
                alt={model.name}
              />
            </LazyLoadComponent>

            <CardHeader className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur">
              <CardTitle>{model.name}</CardTitle>
              <CardDescription>
                {t.rich("assigned_videos_count", {
                  count: model.videos.length,
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

ModelCard.displayName = "ModelCard";
