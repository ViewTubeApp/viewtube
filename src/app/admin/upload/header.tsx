"use client";

import * as m from "@/paraglide/messages";
import { type FC } from "react";

import { PageHeader } from "@/components/page-header";

export const UploadHeader: FC = () => {
  return <PageHeader title={m.upload_video()} />;
};
