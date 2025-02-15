import * as m from "@/paraglide/messages";
import { format } from "date-fns/format";
import { motion } from "motion/react";
import { type FC } from "react";

import { type APITagType } from "@/server/api/routers/tags";

import { motions } from "@/constants/motion";

import { Card } from "@/components/ui/card";

import { TagRowActions } from "./actions";

interface TagCardProps {
  item: APITagType;
}

export const TagCard: FC<TagCardProps> = ({ item: tag }) => {
  return (
    <motion.div {...motions.slide.y.in}>
      <Card className="transition-colors hover:bg-muted/50 isolate relative p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{tag.name}</h3>
            <TagRowActions tag={tag} />
          </div>

          <p className="text-sm text-muted-foreground">{m.assigned_videos_count({ count: tag.assignedVideosCount })}</p>
          <div className="ml-auto text-sm text-muted-foreground">
            {m.created_at({ date: format(tag.createdAt, "dd/MM/yyyy HH:mm") })}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
