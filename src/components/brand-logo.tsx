"use client";

import { env } from "@/env";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { type FC } from "react";

import { cn } from "@/lib/utils";

type BrandLogoProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href?: string;
  contentClassName?: string;
};

export const BrandLogo: FC<BrandLogoProps> = ({ href = "/", contentClassName, ...props }) => {
  return (
    <Link href={href} {...props}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn("flex items-center gap-2 text-primary transition-colors", contentClassName)}
      >
        <Image src="/logo.svg" alt={env.NEXT_PUBLIC_BRAND} width={32} height={32} />
        <h2 className="text-2xl uppercase">
          <span className="tracking-tight text-foreground">PORN</span>
          <span className="font-semibold tracking-wide text-primary">GID</span>
        </h2>
      </motion.div>
    </Link>
  );
};
