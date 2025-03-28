import { getPublicURL } from "@/utils/react/video";
import { BadgeCheck } from "lucide-react";
import * as motion from "motion/react-client";
import { getTranslations } from "next-intl/server";

import { type ModelSelectSchema } from "@/server/db/schema/model.schema";

import { motions } from "@/constants/motion";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NiceImage } from "@/components/ui/nice-image";

interface ModelChannelHeaderProps {
  model: ModelSelectSchema;
}

export async function ModelChannelHeader({ model }: ModelChannelHeaderProps) {
  const t = await getTranslations();

  const viewsCount = Intl.NumberFormat(undefined, { notation: "compact" }).format(1700000);
  const subscribersCount = Intl.NumberFormat(undefined, { notation: "compact" }).format(1337);

  return (
    <>
      <motion.div {...motions.fade.in} className="rounded-xl overflow-hidden border shadow-sm bg-card">
        {/* Banner Background */}
        <motion.div {...motions.scale.reveal} className="relative h-48 md:h-64 w-full">
          <NiceImage
            fill
            src={getPublicURL(model.file_key)}
            alt={`${model.name} banner`}
            style={{ objectFit: "cover" }}
            imageClassName="brightness-75"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </motion.div>

        {/* Channel Info */}
        <div className="relative p-4 pt-8 md:p-6 md:pt-10 flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
          {/* Avatar - positioned to overlap with banner */}
          <motion.div
            {...motions.scale.reveal}
            transition={{ delay: 0.3 }}
            className="absolute -top-16 left-6 md:left-8 border-4 border-foreground/20 rounded-full shadow-md"
          >
            <Avatar className="size-28">
              <AvatarImage src={getPublicURL(model.file_key)} alt={model.name} className="object-cover" />
              <AvatarFallback>{model.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </motion.div>

          {/* Channel Details - with padding to accommodate the avatar */}
          <div className="mt-10 md:mt-0 w-full md:ml-36 flex-1">
            <motion.div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex w-full flex-col gap-2">
                <motion.h1 {...motions.slide.y.in} className="text-3xl font-bold flex items-center gap-2">
                  {model.name}{" "}
                  <BadgeCheck className="size-6 text-blue-500 drop-shadow-[0_0_calc(var(--spacing)_*_2)_var(--color-blue-500)]" />
                </motion.h1>

                <div className="flex items-center justify-between gap-4">
                  <motion.p
                    {...motions.slide.y.in}
                    transition={{ delay: 0.5 }}
                    className="text-muted-foreground text-sm"
                  >
                    {t.rich("subscribers_count", {
                      count: subscribersCount,
                      strong: (chunks) => <span className="text-primary font-bold text-lg">{chunks}</span>,
                    })}
                  </motion.p>
                  <motion.p
                    {...motions.slide.y.in}
                    transition={{ delay: 0.5 }}
                    className="text-muted-foreground text-sm"
                  >
                    {t.rich("views_count", {
                      count: viewsCount,
                      strong: (chunks) => <span className="text-primary font-bold text-lg">{chunks}</span>,
                    })}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.h1 {...motions.slide.y.in} className="text-2xl">
        {t.rich("model_videos", {
          model: model.name,
          strong: (chunks) => <span className="text-primary font-bold">{chunks}</span>,
        })}
      </motion.h1>
    </>
  );
}
