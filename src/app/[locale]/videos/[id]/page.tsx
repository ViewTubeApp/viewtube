import { api } from "@/trpc/server";
import { getPublicURL } from "@/utils/react/video";
import { type Metadata } from "next";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { VideoPageContent } from "./content";

interface VideoPageProps {
  params: Promise<{
    id: string;
    locale: Locale;
  }>;
}

export async function generateMetadata({ params }: VideoPageProps) {
  const { id, locale } = await params;
  const video = await api.video.getVideoById({ id: Number(id) });

  const t = await getTranslations({ locale });
  const title = `${t("title_part_start")}${t("title_part_end")}`;

  return {
    title: video?.title,
    description: video?.description,
    openGraph: {
      locale,
      type: "video.other",
      title: `${title} | ${video?.title}`,
      description: video?.description ?? undefined,
      url: getPublicURL(video?.file_key),
      videos: getPublicURL(video?.file_key),
      images: getPublicURL(video?.poster_key),
    },
  } satisfies Metadata;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  await api.video.viewVideo({ id: Number(id) });
  const video = await api.video.getVideoById({ id: Number(id) });

  if (!video) {
    return notFound();
  }

  return <VideoPageContent id={Number(id)} video={video} />;
}
