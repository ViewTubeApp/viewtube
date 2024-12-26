"use client";

import { useVideoListQuery } from "@/queries/react/use-video-list-query";
import { useRouter } from "next/navigation";
import { type FC } from "react";

import { type VideoExtended } from "@/server/db/schema";

import { adminVideoListQueryOptions } from "@/constants/query";

import { DataTable } from "@/components/ui/data-table";

import { DashboardVideoCard } from "./card";
import { columns } from "./columns";

interface VideoTableProps {
  videos: VideoExtended[];
}

export const DashboardVideoTable: FC<VideoTableProps> = ({ videos: initialVideos }) => {
  const router = useRouter();

  const { data = [] } = useVideoListQuery(adminVideoListQueryOptions, initialVideos);

  const handleNavigateToEdit = (videoId: string) => {
    router.push(`/admin/video/${videoId}/edit`);
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {data.map((video) => (
          // TODO: resolve hydration warning
          <div
            key={video.id}
            suppressHydrationWarning
            onClick={() => handleNavigateToEdit(video.id)}
            className="cursor-pointer"
          >
            <DashboardVideoCard video={video} />
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <DataTable columns={columns} data={data} />
    </>
  );
};
