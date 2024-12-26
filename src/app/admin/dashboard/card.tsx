"use client";

import { useDeleteVideoMutation } from "@/queries/react/use-delete-video.mutation";
import { getClientVideoUrls } from "@/utils/react/video";
import { formatDistance } from "date-fns";
import { MoreVertical, Trash } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { type FC, useState } from "react";

import { type VideoExtended } from "@/server/db/schema";

import { cn } from "@/lib/utils";

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
  video: VideoExtended;
}

export const DashboardVideoCard: FC<DashboardVideoCardProps> = ({ video }) => {
  const [open, setOpen] = useState(false);

  const { getVideoPosterUrl } = getClientVideoUrls();
  const { mutate: deleteVideo } = useDeleteVideoMutation();

  return (
    <Link href={`/admin/video/${video.id}/edit`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: "easeOut" }}>
        <Card className="transition-colors hover:bg-muted/50 isolate relative">
          <div className="overflow-hidden rounded-lg rounded-b-none relative aspect-video w-full">
            <NiceImage fill src={getVideoPosterUrl(video.url)} alt={video.title} className="object-cover" />
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
                {video.status === "completed" ? "Public" : "Processing"}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {formatDistance(video.createdAt, new Date(), { addSuffix: true })}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{video.viewsCount} views</span>
            </div>

            {/* Categories */}
            {video.categoryVideos.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground">Categories</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {video.categoryVideos.map((category) => (
                    <Badge className="text-xs" key={category.category.id}>
                      {category.category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {video.videoTags.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground">Tags</p>
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
              <DropdownMenuItem className="text-destructive" onClick={() => setOpen(true)}>
                <Trash className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      </motion.div>

      <DeleteAlertDialog
        open={open}
        onOpenChange={setOpen}
        header="Are you sure you want to delete this video?"
        onDelete={() => deleteVideo({ id: video.id })}
      />
    </Link>
  );
};
