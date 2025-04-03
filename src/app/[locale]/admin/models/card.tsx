"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import { getPublicURL } from "@/utils/react/video";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { type FC } from "react";
import { LazyLoadComponent } from "react-lazy-load-image-component";

import { type ModelListElement } from "@/server/api/routers/models";

import { motions } from "@/constants/motion";

import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/image";

import { ModelRowActions } from "./actions";

interface ModelCardProps {
  item: ModelListElement;
}

export const ModelCard: FC<ModelCardProps> = ({ item: model }) => {
  const t = useTranslations();
  const fd = useFormattedDistance();

  return (
    <motion.div {...motions.slide.y.in}>
      <Card className="isolate gap-2 relative p-0 pb-4">
        <div className="flex overflow-hidden rounded-xl rounded-b-none relative aspect-video w-full">
          <LazyLoadComponent>
            <Image fill className="brightness-50 object-cover" src={getPublicURL(model.file_key)} alt={model.name} />
          </LazyLoadComponent>
        </div>
        <div className="flex flex-col px-2 gap-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{model.name}</h3>
            <ModelRowActions model={model} />
          </div>

          <p className="text-sm text-muted-foreground">
            {t("assigned_videos_count", { count: model.assigned_videos_count })}
          </p>

          <p className="text-sm text-muted-foreground ml-auto">{t("created_at", { date: fd(model.created_at) })}</p>
        </div>
      </Card>
    </motion.div>
  );
};
