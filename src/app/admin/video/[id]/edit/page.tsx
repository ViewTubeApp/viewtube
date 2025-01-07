import * as m from "@/paraglide/messages";
import { api } from "@/trpc/server";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { EditVideoForm } from "./form";
import { EditVideoHeader } from "./header";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { video } = await api.video.getVideoById({ id: params.id });
  return { title: `${m.edit()} | ${video?.title}` } satisfies Metadata;
}

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
      <EditVideoHeader video={video} />
      <EditVideoForm video={video} />
    </div>
  );
}
