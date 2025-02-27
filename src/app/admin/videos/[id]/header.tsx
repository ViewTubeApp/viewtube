"use client";

import * as m from "@/paraglide/messages";
import { type FC } from "react";

import { type VideoListElement } from "@/server/api/routers/video";

import { PageHeader } from "@/components/page-header";

interface EditVideoHeaderProps {
  video: VideoListElement;
}

export const EditVideoHeader: FC<EditVideoHeaderProps> = ({ video }) => {
  return <PageHeader title={`${m.edit()} | ${video.title}`} />;
};
