import { loadVideoList } from "@/queries/server/load-video-list";
import { type Metadata } from "next";

import { DASHBOARD_QUERY_OPTIONS } from "@/constants/query";

import { DashboardVideoTable } from "@/components/dashboard-video-table";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const videos = await loadVideoList(DASHBOARD_QUERY_OPTIONS);

  return (
    <div className="lg:container lg:mx-auto">
      <PageHeader title="Dashboard" />
      <DashboardVideoTable videos={videos} />
    </div>
  );
}
