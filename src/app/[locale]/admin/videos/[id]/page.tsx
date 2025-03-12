import { type Locale } from "@/i18n/routing";
import { api } from "@/trpc/server";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { UploadVideoForm, type UploadVideoFormValues } from "../_components/form";
import { EditVideoHeader } from "./header";

interface EditVideoPageProps {
  params: Promise<{
    id: string;
    locale: Locale;
  }>;
}

export async function generateMetadata({ params }: EditVideoPageProps) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale });
  const { video } = await api.video.getVideoById({ id: Number(id) });
  return { title: `${t("edit")} | ${video?.title}` } satisfies Metadata;
}

export default async function EditVideoPage({ params }: EditVideoPageProps) {
  const { id } = await params;

  const { video } = await api.video.getVideoById({ id: Number(id) });

  if (!video) {
    notFound();
  }

  const defaultValues: UploadVideoFormValues = {
    url: video.url ?? undefined,
    title: video.title ?? undefined,
    description: video.description ?? undefined,
    tags: video.videoTags.map((tag) => tag.tag.name),
    categories: video.categoryVideos.map((category) => category.category),
    models: video.modelVideos.map((model) => model.model),
  };

  return (
    <div className="lg:container lg:mx-auto">
      <EditVideoHeader video={video} />
      <UploadVideoForm videoId={video.id} defaultValues={defaultValues} />
    </div>
  );
}
