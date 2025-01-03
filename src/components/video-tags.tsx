import { type FC } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "./ui/badge";

interface VideoTagsProps {
  tags: string[];
  className?: string;
}

export const VideoTags: FC<VideoTagsProps> = ({ tags, className }) => {
  if (!tags.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="rounded-sm px-1 font-normal">
          {tag}
        </Badge>
      ))}
    </div>
  );
};
