"use client";

import { env } from "@/env";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { type FC } from "react";

import { cn } from "@/lib/utils";

import { motions } from "@/constants/motion";

type BrandLogoProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href?: string;
  hideText?: boolean;
  disableAnimation?: boolean;
  contentClassName?: string;
};

export const BrandLogo: FC<BrandLogoProps> = ({
  href = "/",
  contentClassName,
  hideText = false,
  disableAnimation = false,
  ...props
}) => {
  const t = useTranslations();

  return (
    <Link href={href} {...props} prefetch>
      <motion.div
        {...(disableAnimation ? {} : motions.slide.x.in)}
        className={cn("flex items-center gap-2 text-primary transition-colors", contentClassName)}
      >
        <Image src="/logo.svg" className="w-auto h-auto" alt={env.NEXT_PUBLIC_BRAND} width={32} height={32} />
        {!hideText && (
          <motion.h2 key={href} className="text-2xl uppercase" {...(disableAnimation ? {} : motions.fade.in)}>
            <span className="tracking-tight text-foreground">{t("title_part_start")}</span>
            <span className="font-semibold tracking-wide text-primary">{t("title_part_end")}</span>
          </motion.h2>
        )}
      </motion.div>
    </Link>
  );
};
