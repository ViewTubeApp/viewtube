import * as motion from "motion/react-client";
import { getTranslations } from "next-intl/server";
import { type FC } from "react";
import { match } from "ts-pattern";

import { motions } from "@/constants/motion";

interface SortHeaderProps {
  variant: "new" | "popular";
}

export const SortHeader: FC<SortHeaderProps> = async ({ variant }) => {
  const t = await getTranslations();
  const videosCount = Intl.NumberFormat(undefined, { notation: "compact" }).format(1337);

  const label = match(variant)
    .with("new", () =>
      t.rich("new_videos", {
        strong: (chunks) => <span className="text-primary font-bold">{chunks}</span>,
      }),
    )
    .with("popular", () =>
      t.rich("popular_videos", {
        strong: (chunks) => <span className="text-primary font-bold">{chunks}</span>,
      }),
    )
    .exhaustive();

  return (
    <div className="space-y-1">
      <motion.h1 {...motions.slide.y.in} className="text-2xl">
        {label}
      </motion.h1>
      <motion.p {...motions.slide.y.in} transition={{ delay: 0.3 }} className="text-sm text-muted-foreground">
        {t.rich("assigned_videos_count", {
          count: videosCount,
          strong: (chunks) => <span className="text-primary font-bold">{chunks}</span>,
        })}
      </motion.p>
    </div>
  );
};
