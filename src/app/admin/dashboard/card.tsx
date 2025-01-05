"use client";

import { useFormattedDistance } from "@/hooks/use-formatted-distance";
import * as m from "@/paraglide/messages";
import { useDeleteVideoMutation } from "@/queries/react/use-delete-video.mutation";
import { getPublicURL } from "@/utils/react/video";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { motion } from "motion/react";
import { type FC, useState } from "react";

import { type VideoResponse } from "@/server/api/routers/video";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { motions } from "@/constants/motion";

import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { NiceImage } from "@/components/nice-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardVideoCardProps {
  video: VideoResponse;
}

export const DashboardVideoCard: FC<DashboardVideoCardProps> = ({ video }) => {
  const [open, setOpen] = useState(false);
  const { mutate: deleteVideo } = useDeleteVideoMutation();
  const formattedDistance = useFormattedDistance();

  return (
    <motion.div {...motions.slide.y.in}>
      <Card className="transition-colors hover:bg-muted/50 isolate relative">
        <div className="overflow-hidden rounded-lg rounded-b-none relative aspect-video w-full">
          <NiceImage fill src={getPublicURL(video.url).forType("poster")} alt={video.title} className="object-cover" />
        </div>
        <div className="space-y-4 p-4">
          <h3 className="line-clamp-2 font-medium">{video.title}</h3>
          {video.description && <p className="line-clamp-2 text-sm text-muted-foreground">{video.description}</p>}

          <div className="flex items-center gap-2 text-sm">
            <span
              className={cn("rounded-full px-2 py-0.5 text-xs", {
                "bg-green-500/10 text-green-500": video.status === "completed",
                "bg-yellow-500/10 text-yellow-500": video.status === "processing",
              })}
            >
              {m[`status_${video.status}`]()}
            </span>
            <span className="text-muted-foreground">{m.created_at({ date: formattedDistance(video.createdAt) })}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {m.views_count({ count: Intl.NumberFormat("en-US", { notation: "compact" }).format(video.viewsCount) })}
            </span>
          </div>

          {/* Categories */}
          {video.categoryVideos.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground">{m.categories()}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {video.categoryVideos.map((category) => (
                  <Badge className="text-xs" key={category.category.id}>
                    {category.category.slug}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {video.videoTags.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground">{m.tags()}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {video.videoTags.map((tag) => (
                  <Badge className="text-xs" key={tag.tag.id}>
                    {tag.tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-2 right-2">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <Link href={`/admin/video/${video.id}/edit`}>
              <DropdownMenuItem className="cursor-pointer">
                <Pencil className="size-4" />
                {m.edit()}
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setOpen(true)}>
              <Trash className="size-4" />
              {m.delete_str()}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
      <DeleteAlertDialog
        open={open}
        onOpenChange={setOpen}
        header={m.delete_dialog_title()}
        onDelete={() => deleteVideo({ id: video.id })}
      />
    </motion.div>
  );
};
