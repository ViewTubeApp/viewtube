"use client";

import { env } from "@/env";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { type FC } from "react";

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
        {!hideText && (
          <h2 className="text-2xl uppercase">
            <span className="tracking-tight text-foreground">PORN</span>
            <span className="font-semibold tracking-wide text-primary">GID</span>
          </h2>
        )}
      </motion.div>
    </Link>
  );
};
