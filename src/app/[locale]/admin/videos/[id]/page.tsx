import { api } from "@/trpc/server";
import { type Metadata } from "next";
import { type Locale } from "next-intl";
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
  const video = await api.video.getVideoById({ id: Number(id) });
  return { title: `${t("edit")} | ${video?.title}` } satisfies Metadata;
}

export default async function EditVideoPage({ params }: EditVideoPageProps) {
  const { id } = await params;

  const video = await api.video.getVideoById({ id: Number(id) });

  if (!video) {
    notFound();
  }

  const defaultValues: UploadVideoFormValues = {
    file_key: video.file_key ?? undefined,
    title: video.title ?? undefined,
    description: video.description ?? undefined,
    tags: video.video_tags.map((tag) => tag.tag.name),
    categories: video.category_videos.map((category) => category.category),
    models: video.model_videos.map((model) => model.model),
  };

  return (
    <div className="lg:container lg:mx-auto">
      <EditVideoHeader video={video} />
      <UploadVideoForm videoId={video.id} defaultValues={defaultValues} />
    </div>
  );
}
