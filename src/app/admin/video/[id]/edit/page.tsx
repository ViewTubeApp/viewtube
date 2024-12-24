import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

import { EditVideoForm } from "@/components/edit-video-form";

import { EditVideoHeader } from "./header";

interface EditVideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVideoPage({ params }: EditVideoPageProps) {
  const { id } = await params;

  const { video } = await api.video.getVideoById({ id });

  if (!video) {
    notFound();
  }

  return (
    <div className="lg:container lg:mx-auto">
      <EditVideoHeader />
      <EditVideoForm video={video} />
    </div>
  );
}
