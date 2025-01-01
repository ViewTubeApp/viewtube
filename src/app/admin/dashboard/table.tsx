"use client";

import { useVideoListQuery } from "@/queries/react/use-video-list.query";
import { type FC } from "react";

import { type VideoListResponse } from "@/server/api/routers/video";

import { adminVideoListQueryOptions } from "@/constants/query";

import { DataTable } from "@/components/ui/data-table";

import { DashboardVideoCard } from "./card";
import { useDashboardColumns } from "./columns";

interface VideoTableProps {
  videos: VideoListResponse;
}

export const DashboardVideoTable: FC<VideoTableProps> = ({ videos: initialData }) => {
  const columns = useDashboardColumns();
  const { data = [] } = useVideoListQuery(adminVideoListQueryOptions, { initialData });

  return <DataTable columns={columns} data={data} renderCard={(video) => <DashboardVideoCard video={video} />} />;
};
