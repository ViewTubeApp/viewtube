import { api } from "@/trpc/server";
import { EditVideoForm } from "@/components/edit-video-form";
import { notFound } from "next/navigation";

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
    <>
      <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Edit Video</h1>
      <EditVideoForm video={video} />
    </>
  );
}
