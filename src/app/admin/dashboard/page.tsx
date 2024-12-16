import { DashboardVideoTable } from "@/components/dashboard-video-table";
import { DASHBOARD_QUERY_OPTIONS } from "@/constants/query";
import { api } from "@/trpc/server";

export default async function DashboardPage() {
  const videos = await api.video.getVideoList(DASHBOARD_QUERY_OPTIONS);
  void api.video.getVideoList.prefetch(DASHBOARD_QUERY_OPTIONS);

  return (
    <div className="lg:container lg:mx-auto">
      <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Content</h1>
      <DashboardVideoTable videos={videos} />
    </div>
  );
}
