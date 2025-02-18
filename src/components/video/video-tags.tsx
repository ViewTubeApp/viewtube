import { CircleUser, Hash, LayoutList } from "lucide-react";
import { type FC } from "react";

import { type CategorySelectSchema, type ModelSelectSchema, type TagSelectSchema } from "@/server/db/schema";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { Badge } from "../ui/badge";

interface VideoTagsProps {
  tags: TagSelectSchema[];
  className?: string;
}

export const VideoTags: FC<VideoTagsProps> = ({ tags, className }) => {
  if (!tags.length) return null;

  return (
    <div className={cn("contents", className)}>
      {tags.map((tag) => (
        <Link key={tag.id} href={{ pathname: "/videos", query: { t: tag.id } }}>
          <Badge variant="secondary" className="rounded-sm px-1 font-normal">
            <Hash className="mr-0.5 size-3" />
            {tag.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
};

interface VideoCategoriesProps {
  categories: CategorySelectSchema[];
  className?: string;
}

export const VideoCategories: FC<VideoCategoriesProps> = ({ categories, className }) => {
  if (!categories.length) return null;

  return (
    <div className={cn("contents", className)}>
      {categories.map((category) => (
        <Link key={category.id} href={{ pathname: "/videos", query: { c: category.id } }}>
          <Badge variant="secondary" className="rounded-sm px-1 font-normal">
            <LayoutList className="mr-0.5 size-3" />
            {category.slug}
          </Badge>
        </Link>
      ))}
    </div>
  );
};

interface VideoModelsProps {
  models: ModelSelectSchema[];
  className?: string;
}

export const VideoModels: FC<VideoModelsProps> = ({ models, className }) => {
  if (!models.length) return null;

  return (
    <div className={cn("contents", className)}>
      {models.map((model) => (
        <Link key={model.id} href={{ pathname: "/videos", query: { m: model.id } }}>
          <Badge variant="secondary" className="rounded-sm px-1 font-normal">
            <CircleUser className="mr-1 size-3" />
            {model.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
};
