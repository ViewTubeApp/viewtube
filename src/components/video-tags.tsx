import { type FC } from "react";

import { type Category, type Model, type Tag } from "@/server/db/schema";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { Badge } from "./ui/badge";

interface VideoTagsProps {
  tags: Tag[];
  className?: string;
}

export const VideoTags: FC<VideoTagsProps> = ({ tags, className }) => {
  if (!tags.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tags.map((tag) => (
        <Link key={tag.id} href={{ pathname: "/videos", query: { t: tag.id } }}>
          <Badge variant="secondary" className="rounded-sm px-1 font-normal">
            {tag.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
};

interface VideoCategoriesProps {
  categories: Category[];
  className?: string;
}

export const VideoCategories: FC<VideoCategoriesProps> = ({ categories, className }) => {
  if (!categories.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {categories.map((category) => (
        <Link key={category.id} href={{ pathname: "/videos", query: { c: category.id } }}>
          <Badge variant="secondary" className="rounded-sm px-1 font-normal">
            {category.slug}
          </Badge>
        </Link>
      ))}
    </div>
  );
};

interface VideoModelsProps {
  models: Model[];
  className?: string;
}

export const VideoModels: FC<VideoModelsProps> = ({ models, className }) => {
  if (!models.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {models.map((model) => (
        <Link key={model.id} href={{ pathname: "/videos", query: { m: model.id } }}>
          <Badge variant="secondary" className="rounded-sm px-1 font-normal">
            {model.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
};
