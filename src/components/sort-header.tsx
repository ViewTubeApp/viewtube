import { Link } from "@/i18n/navigation";
import * as motion from "motion/react-client";
import { getTranslations } from "next-intl/server";
import { type FC } from "react";
import { match } from "ts-pattern";

import { motions } from "@/constants/motion";

import { Button } from "./ui/button";

interface SortHeaderProps {
  href?: string;
  delay?: number;
  variant: "new" | "popular" | "other";
}

export const SortHeader: FC<SortHeaderProps> = async ({ variant, href, delay = 0 }) => {
  const t = await getTranslations();
  const count = Intl.NumberFormat(undefined, { notation: "compact" }).format(Math.random() * 10_000);

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
    .with("other", () =>
      t.rich("other_videos", { strong: (chunks) => <span className="text-primary font-bold">{chunks}</span> }),
    )
    .exhaustive();

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <motion.h1 {...motions.slide.y.in} transition={{ delay }} className="text-2xl">
          {label}
        </motion.h1>

        {href && (
          <motion.div {...motions.slide.y.in} transition={{ delay }}>
            <Link href={href} prefetch>
              <Button variant="link" size="sm" className="p-0">
                {t("view_all")}
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
      <motion.p {...motions.slide.y.in} transition={{ delay }} className="text-sm text-muted-foreground">
        {t.rich("assigned_videos_count", {
          count: count,
          strong: (chunks) => <span className="text-primary font-bold">{chunks}</span>,
        })}
      </motion.p>
    </div>
  );
};
