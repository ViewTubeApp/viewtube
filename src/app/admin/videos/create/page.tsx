import * as m from "@/paraglide/messages";
import { type Metadata } from "next";

import { UploadVideoForm } from "../_components/form";
import { UploadHeader } from "./header";

export function generateMetadata() {
  return { title: m.upload_video() } satisfies Metadata;
}

export default async function UploadVideoPage() {
  return (
    <div className="lg:container lg:mx-auto">
      <UploadHeader />
      <UploadVideoForm />
    </div>
  );
}
