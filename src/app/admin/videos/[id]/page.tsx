import * as m from "@/paraglide/messages";
import { api } from "@/trpc/server";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

import { EditVideoForm } from "./form";
import { EditVideoHeader } from "./header";

interface EditVideoPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditVideoPageProps) {
  const { id } = await params;
  const { video } = await api.video.getVideoById({ id: Number(id) });
  return { title: `${m.edit()} | ${video?.title}` } satisfies Metadata;
}

export default async function EditVideoPage({ params }: EditVideoPageProps) {
  const { id } = await params;

  const { video } = await api.video.getVideoById({ id: Number(id) });

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
