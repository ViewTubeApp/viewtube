"use client";

import { useVideoListQuery } from "@/queries/react/use-video-list-query";
import { type ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { formatDistance } from "date-fns";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type FC } from "react";

import { type VideoExtended, type VideoTaskStatus } from "@/server/db/schema";

import { log } from "@/lib/logger";
import { cn } from "@/lib/utils";
import { getClientVideoUrls } from "@/lib/video/client";

import { DASHBOARD_QUERY_OPTIONS } from "@/constants/query";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { DashboardVideoCard } from "./dashboard-video-card";
import { DeleteAlertDialog } from "./delete-alert-dialog";
import { VideoPoster } from "./video-poster";

interface VideoTableProps {
  videos: VideoExtended[];
}

export const DashboardVideoTable: FC<VideoTableProps> = ({ videos: initialVideos }) => {
  const router = useRouter();

  const { data: videos = [] } = useVideoListQuery(DASHBOARD_QUERY_OPTIONS, initialVideos);

  log.debug("videos", videos, initialVideos);

  const { getVideoPosterUrl, getVideoTrailerUrl } = getClientVideoUrls();

  const handleNavigateToEdit = (videoId: string) => {
    router.push(`/admin/video/${videoId}/edit`);
  };

  const columns: ColumnDef<VideoExtended>[] = [
    {
      accessorKey: "thumbnail",
      header: "",
      cell: ({ row }) => {
        const video = row.original;
        return (
          <div className="relative aspect-video h-20 w-36 overflow-hidden">
            <VideoPoster title={video.title} poster={getVideoPosterUrl(video.url)} trailer={getVideoTrailerUrl(video.url)} />
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const video = row.original;
        return (
          <div className="flex flex-col gap-1">
            <span className="line-clamp-1 max-w-md font-medium">{video.title}</span>
            <span className="line-clamp-2 max-w-md text-sm text-muted-foreground">{video.description}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const video = row.original;

        const statusColorMap: Record<VideoTaskStatus, string> = {
          completed: "text-green-500",
          processing: "text-yellow-500",
          failed: "text-red-500",
          pending: "text-gray-500",
        };

        return <span className={cn("whitespace-nowrap text-sm capitalize", statusColorMap[video.status])}>{video.status}</span>;
      },
    },
    {
      accessorKey: "uploaded",
      header: "Uploaded",
      cell: ({ row }) => {
        const video = row.original;
        return <span className="whitespace-nowrap text-sm">{formatDistance(video.createdAt, new Date(), { addSuffix: true })}</span>;
      },
    },
    {
      accessorKey: "views",
      header: "Views",
      cell: ({ row }) => {
        const video = row.original;
        return <span className="text-sm">{video.viewsCount}</span>;
      },
    },
    {
      accessorKey: "comments",
      header: "Comments",
      cell: () => <span className="text-sm">0</span>,
    },
    {
      accessorKey: "likes",
      header: "Likes",
      cell: () => <span className="text-sm">0</span>,
    },
    {
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => <DeleteAlertDialog videoId={row.original.id} />,
    },
  ];

  const table = useReactTable({
    data: videos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {videos.map((video) => (
          <div key={video.id} onClick={() => handleNavigateToEdit(video.id)} className="cursor-pointer">
            <DashboardVideoCard video={video} />
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut" }}
        className="hidden w-full overflow-hidden rounded-md border md:block"
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => handleNavigateToEdit(row.original.id)}
                className="cursor-pointer transition-colors hover:bg-muted/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </>
  );
};
