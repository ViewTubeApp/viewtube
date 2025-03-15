import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import { getPublicURL } from "@/utils/react/video";
import { cn } from "@/utils/shared/clsx";
import { type ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { type VideoListElement } from "@/server/api/routers/video";
import { type VideoTaskStatus } from "@/server/db/schema";

import { VideoPoster } from "@/components/video/video-poster";

import { DashboardRowActions } from "./actions";
import { DashboardRowCategories } from "./categories";
import { DashboardRowModels } from "./models";
import { DashboardRowTags } from "./tags";

export function useDashboardColumns() {
  const t = useTranslations();
  const formattedDistance = useFormattedDistance();

  return [
    {
      accessorKey: "thumbnail",
      header: t("thumbnail"),
      cell: ({ row }) => {
        const video = row.original;
        return (
          <div className="relative aspect-video rounded-lg w-36 overflow-hidden">
            <VideoPoster
              title={video.title}
              poster={getPublicURL(video.url).forType("poster")}
              trailer={getPublicURL(video.url).forType("trailer")}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: t("title"),
      size: 512,
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
      header: t("status"),
      cell: ({ row }) => {
        const video = row.original;

        const statusColorMap: Record<VideoTaskStatus, string> = {
          completed: "text-green-500",
          processing: "text-yellow-500",
          failed: "text-red-500",
          pending: "text-gray-500",
        };

        return (
          <span className={cn("whitespace-nowrap text-sm", statusColorMap[video.status])}>
            {t(`status_${video.status}`)}
          </span>
        );
      },
    },
    {
      accessorKey: "uploaded",
      header: t("uploaded"),
      cell: ({ row }) => {
        const video = row.original;
        return <span className="whitespace-nowrap text-sm">{formattedDistance(video.createdAt)}</span>;
      },
    },
    {
      accessorKey: "views",
      header: t("views"),
      cell: ({ row }) => {
        const video = row.original;
        return <span className="text-sm">{video.viewsCount}</span>;
      },
    },
    {
      accessorKey: "tags",
      header: t("tags"),
      cell: ({ row }) => {
        const video = row.original;
        return <DashboardRowTags video={video} />;
      },
    },
    {
      accessorKey: "categories",
      header: t("categories"),
      cell: ({ row }) => {
        const video = row.original;
        return <DashboardRowCategories video={video} />;
      },
    },
    {
      accessorKey: "models",
      header: t("models"),
      cell: ({ row }) => {
        const video = row.original;
        return <DashboardRowModels video={video} />;
      },
    },
    {
      id: "actions",
      size: 64,
      cell: ({ row }) => {
        const video = row.original;
        return <DashboardRowActions video={video} />;
      },
    },
  ] satisfies ColumnDef<VideoListElement>[];
}
