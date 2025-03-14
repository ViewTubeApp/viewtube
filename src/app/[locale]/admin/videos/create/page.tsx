import { type Metadata } from "next";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { UploadVideoForm } from "../_components/form";
import { UploadHeader } from "./header";

interface UploadVideoPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: UploadVideoPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("upload_video") } satisfies Metadata;
}

export default function UploadVideoPage() {
  return (
    <div className="lg:container lg:mx-auto">
      <UploadHeader />
      <UploadVideoForm />
    </div>
  );
}
