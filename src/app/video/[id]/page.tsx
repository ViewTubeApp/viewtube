import { api } from "@/trpc/server";

import { VideoPageContent } from "@/components/video-page-content";

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;

  const { video, related } = await api.video.getVideoById({ id });

  if (!video) {
    return null;
  }

  return <VideoPageContent video={video} related={related} />;
}
