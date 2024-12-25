import { loadVideoList } from "@/queries/server/load-video-list";
import { type Metadata } from "next";

import { adminVideoListQueryOptions } from "@/constants/query";

import { PageHeader } from "@/components/page-header";

import { DashboardVideoTable } from "./table";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const videos = await loadVideoList(adminVideoListQueryOptions);

  return (
    <div className="lg:container lg:mx-auto">
      <PageHeader title="Dashboard" />
      <DashboardVideoTable videos={videos} />
    </div>
  );
}
