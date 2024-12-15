import { api } from "@/trpc/server";
import { EditVideoForm } from "@/components/edit-video-form";
import { notFound } from "next/navigation";

interface EditVideoPageProps {
  params: {
    id: string;
  };
}

export default async function EditVideoPage({ params }: EditVideoPageProps) {
  const { video } = await api.video.getVideoById({ id: params.id });

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
