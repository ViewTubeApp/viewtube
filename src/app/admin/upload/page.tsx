import { type Metadata } from "next";

import { PageHeader } from "@/components/page-header";

import { UploadVideoForm } from "./form";

export const metadata: Metadata = {
  title: "Upload",
};

export default async function UploadVideoPage() {
  return (
    <div className="lg:container lg:mx-auto">
      <PageHeader title="Upload" />
      <UploadVideoForm />
    </div>
  );
}
