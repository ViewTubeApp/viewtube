import { loadVideoList } from "@/queries/server/load-video-list";

import { DASHBOARD_QUERY_OPTIONS } from "@/constants/query";

import { DashboardVideoTable } from "@/components/dashboard-video-table";
import { PageHeader } from "@/components/page-header";

export default async function DashboardPage() {
  const videos = await loadVideoList(DASHBOARD_QUERY_OPTIONS);

  return (
    <div className="lg:container lg:mx-auto">
      <PageHeader title="Dashboard" />
      <DashboardVideoTable videos={videos} />
    </div>
  );
}
