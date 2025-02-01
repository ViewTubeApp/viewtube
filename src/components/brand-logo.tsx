"use client";

import { env } from "@/env";
import * as m from "@/paraglide/messages";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { type FC } from "react";

import { Link } from "@/lib/i18n";
import { cn } from "@/lib/utils";

import { motions } from "@/constants/motion";

type BrandLogoProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href?: string;
  hideText?: boolean;
  contentClassName?: string;
};

export const BrandLogo: FC<BrandLogoProps> = ({ href = "/", contentClassName, hideText = false, ...props }) => {
  return (
    <Link href={href} {...props}>
      <motion.div
        {...motions.slide.x.in}
        className={cn("flex items-center gap-2 text-primary transition-colors", contentClassName)}
      >
        <Image src="/logo.svg" alt={env.NEXT_PUBLIC_BRAND} width={32} height={32} />
        <AnimatePresence>
          {!hideText && (
            <motion.h2 key={href} className="text-2xl uppercase" {...motions.fade.in}>
              <span className="tracking-tight text-foreground">{m.title_part_start()}</span>
              <span className="font-semibold tracking-wide text-primary">{m.title_part_end()}</span>
            </motion.h2>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
};
