import { api } from "@/trpc/server";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { EditVideoForm } from "@/components/edit-video-form";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Edit",
};

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
      <PageHeader title={`Edit | ${video.title}`} />
      <EditVideoForm video={video} />
    </div>
  );
}
