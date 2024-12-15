import { DashboardVideoTable } from "@/components/dashboard-video-table";
import { LOAD_COUNT } from "@/constants/shared";
import { api } from "@/trpc/server";

export default async function DashboardPage() {
  const videos = await api.video.getVideoList({ count: LOAD_COUNT });
  void api.video.getVideoList.prefetch({ count: LOAD_COUNT });

  return (
    <div className="lg:container lg:mx-auto">
      <h1 className="mb-4 text-xl font-semibold sm:text-2xl">Content</h1>
      <DashboardVideoTable videos={videos} />
    </div>
  );
}
