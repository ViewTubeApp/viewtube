import { getTranslations } from "next-intl/server";
import { type FC } from "react";

import { type VideoListElement } from "@/server/api/routers/video";

import { PageHeader } from "@/components/page-header";

interface EditVideoHeaderProps {
  video: VideoListElement;
}

export const EditVideoHeader: FC<EditVideoHeaderProps> = async ({ video }) => {
  const t = await getTranslations();
  return <PageHeader title={`${t("edit")} | ${video.title}`} />;
};
