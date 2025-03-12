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

  // Increment views count
  await api.video.incrementViewsCount({ id: Number(id) });

  // Get video, comments and related videos
  const video = await api.video.getVideoById({ id: Number(id) });
  const comments = await api.comments.getComments({ videoId: Number(id) });

  if (!video) {
    return notFound();
  }

  return <VideoPageContent id={Number(id)} video={video} comments={comments} />;
}
