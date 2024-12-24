import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

import { VideoPageContent } from "@/components/video-page-content";

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  const { video, related } = await api.video.getVideoById({ id });

  if (!video) {
    return notFound();
  }

  return <VideoPageContent video={video} related={related} />;
}

export async function generateMetadata({ params }: VideoPageProps) {
  const { id } = await params;
  const { video } = await api.video.getVideoById({ id });
  return { title: video?.title };
}
