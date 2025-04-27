import { getPublicURL } from "@/utils/react/video";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns/format";
import { useLiveQuery } from "dexie-react-hooks";
import { useTranslations } from "next-intl";

import { type VideoListElement } from "@/server/api/routers/video";

import { db } from "@/lib/db";

import { RunStatus } from "@/components/run-status";
import { VideoPoster } from "@/components/video/video-poster";

import { DashboardRowActions } from "./actions";
import { DashboardRowCategories } from "./categories";
import { DashboardRowModels } from "./models";
import { DashboardRowTags } from "./tags";

export function useDashboardColumns() {
  const t = useTranslations();
  const runs = useLiveQuery(() => db.runs.toArray());

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
              duration={video.video_duration}
              poster={getPublicURL(video.poster_key)}
              trailer={getPublicURL(video.trailer_key)}
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
        const run = runs?.find((r) => r.videoId === video.id);

        if (video.status === "completed") {
          return <span className="whitespace-nowrap text-sm text-green-500">{t("status_completed")}</span>;
        }

        if (!run) {
          return <span className="whitespace-nowrap text-sm text-gray-500">{t("status_pending")}</span>;
        }

        return <RunStatus run={run} />;
      },
    },
    {
      accessorKey: "uploaded",
      header: t("uploaded"),
      cell: ({ row }) => {
        return <span className="whitespace-nowrap text-sm">{format(row.original.created_at, "dd.MM.yyyy HH:mm")}</span>;
      },
    },
    {
      accessorKey: "views",
      header: t("views"),
      cell: ({ row }) => {
        const video = row.original;
        return <span className="text-sm">{video.views_count}</span>;
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
