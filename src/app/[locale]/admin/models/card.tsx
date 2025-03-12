"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import { getPublicURL } from "@/utils/react/video";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { type FC } from "react";

import { type ModelListElement } from "@/server/api/routers/models";

import { motions } from "@/constants/motion";

import { NiceImage } from "@/components/nice-image";
import { Card } from "@/components/ui/card";

import { ModelRowActions } from "./actions";

interface ModelCardProps {
  item: ModelListElement;
}

export const ModelCard: FC<ModelCardProps> = ({ item: model }) => {
  const t = useTranslations();
  const formattedDistance = useFormattedDistance();

  return (
    <motion.div {...motions.slide.y.in}>
      <Card className="transition-colors hover:bg-muted/50 isolate relative space-y-4">
        <div className="flex overflow-hidden rounded-lg rounded-b-none relative aspect-video w-full">
          <NiceImage
            fill
            style={{ objectFit: "cover" }}
            loading="lazy"
            className="rounded-lg brightness-50"
            src={getPublicURL(model.imageUrl).forType("file")}
            alt={model.name}
          />
        </div>
        <div className="flex flex-col p-4 pt-0 gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{model.name}</h3>
            <ModelRowActions model={model} />
          </div>

          <p className="text-sm text-muted-foreground">
            {t("assigned_videos_count", { count: model.assignedVideosCount })}
          </p>

          <p className="text-sm text-muted-foreground ml-auto">
            {t("created_at", { date: formattedDistance(model.createdAt) })}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};
