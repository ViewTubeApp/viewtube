"use client";

import * as m from "@/paraglide/messages";
import { type FC } from "react";

import { type Video } from "@/server/db/schema";

import { PageHeader } from "@/components/page-header";

interface EditVideoHeaderProps {
  video: Video;
}

export const EditVideoHeader: FC<EditVideoHeaderProps> = ({ video }) => {
  return <PageHeader title={`${m.edit()} | ${video.title}`} />;
};
