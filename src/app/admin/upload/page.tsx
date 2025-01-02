import * as m from "@/paraglide/messages";
import { type Metadata } from "next";

import { PageHeader } from "@/components/page-header";

import { UploadVideoForm } from "./form";

export function generateMetadata() {
  return { title: m.upload_video() } satisfies Metadata;
}

export default async function UploadVideoPage() {
  return (
    <div className="lg:container lg:mx-auto">
      <PageHeader title={m.upload_video()} />
      <UploadVideoForm />
    </div>
  );
}
