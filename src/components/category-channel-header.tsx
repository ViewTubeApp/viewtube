import { getPublicURL } from "@/utils/react/video";
import * as motion from "motion/react-client";
import { getTranslations } from "next-intl/server";

import { type CategorySelectSchema } from "@/server/db/schema/category.schema";

import { motions } from "@/constants/motion";

import { Image } from "@/components/ui/image";

interface CategoryChannelHeaderProps {
  category: CategorySelectSchema;
}

export async function CategoryChannelHeader({ category }: CategoryChannelHeaderProps) {
  const t = await getTranslations();
  const videosCount = Intl.NumberFormat(undefined, { notation: "compact" }).format(42);

  return (
    <motion.div {...motions.fade.in} className="relative rounded-xl overflow-hidden border shadow-sm bg-card">
      <div className="h-40 sm:h-48 relative">
        {/* Banner image */}
        <Image fill src={getPublicURL(category.file_key)} alt={category.slug} className="object-cover" />

        {/* Simple gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />

        {/* Category title overlay */}
        <div className="absolute bottom-0 left-0 p-4 space-y-1 sm:p-6">
          <motion.h1 {...motions.slide.y.in} className="text-3xl sm:text-4xl font-bold capitalize text-white">
            {category.slug}
          </motion.h1>

          <motion.h1 {...motions.slide.y.in} transition={{ delay: 0.3 }} className="text-2xl">
            {t.rich("category_videos_count", {
              count: videosCount,
              strong: (chunks) => <span className="text-primary font-bold">{chunks}</span>,
            })}
          </motion.h1>
        </div>
      </div>
    </motion.div>
  );
}
