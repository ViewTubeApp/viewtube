"use client";

import { useDeleteVideoMutation } from "@/queries/react/use-delete-video-mutation";
import { getClientVideoUrls } from "@/utils/react/video";
import { formatDistance } from "date-fns";
import { MoreVertical, Trash } from "lucide-react";
import { motion } from "motion/react";
import { type FC, useState } from "react";

import { type VideoExtended } from "@/server/db/schema";

import { cn } from "@/lib/utils";

import { DeleteAlertDialog } from "@/components/delete-alert-dialog";
import { NiceImage } from "@/components/nice-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const DashboardVideoCard: FC<{ video: VideoExtended }> = ({ video }) => {
  const [open, setOpen] = useState(false);

  const { getVideoPosterUrl } = getClientVideoUrls();
  const { mutate: deleteVideo } = useDeleteVideoMutation();

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: "easeOut" }}>
        <Card className="transition-colors hover:bg-muted/50 isolate relative">
          <div className="overflow-hidden rounded-lg relative aspect-video w-full">
            <NiceImage fill src={getVideoPosterUrl(video.url)} alt={video.title} className="object-cover" />
          </div>
          <div className="space-y-2 p-4">
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
              <span className="text-muted-foreground">{formatDistance(video.createdAt, new Date(), { addSuffix: true })}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{video.viewsCount} views</span>
              <span>0 comments</span>
              <span>0 likes</span>
            </div>
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
    </>
  );
};
