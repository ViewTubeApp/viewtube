import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

import { VideoPageContent } from "./content";

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: VideoPageProps) {
  const { id } = await params;
  const { video } = await api.video.getVideoById({ id: Number(id), shallow: true });
  return { title: video?.title };
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;
  const { video, related } = await api.video.getVideoById({ id: Number(id), related: true });
  const comments = await api.comments.getComments({ videoId: Number(id) });

  if (!video) {
    return notFound();
  }

  return <VideoPageContent id={Number(id)} video={video} related={related} comments={comments} />;
}
