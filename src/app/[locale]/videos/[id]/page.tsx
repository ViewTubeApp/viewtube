import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

import { VideoPageContent } from "./content";

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: VideoPageProps) {
  const { id } = await params;
  const video = await api.video.getVideoById({ id: Number(id) });
  return { title: video?.title };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  await api.video.incrementViewsCount({ id: Number(id) });
  const video = await api.video.getVideoById({ id: Number(id) });

  if (!video) {
    return notFound();
  }

  return <VideoPageContent id={Number(id)} video={video} />;
}
