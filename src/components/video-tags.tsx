import { type FC } from "react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface VideoTagsProps {
  tags: string[];
  className?: string;
}

export const VideoTags: FC<VideoTagsProps> = ({ tags, className }) => {
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
