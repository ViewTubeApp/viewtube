"use client";

import { cn } from "@/utils/shared/clsx";
import { type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { type ReactNode } from "react";
import { type Url } from "url";

import { Button } from "./ui/button";

type IconButtonProps = {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
} & (
  | {
      href: string | Url;
      onClick?: never;
    }
  | {
      href?: never;
      onClick?: () => void;
    }
);

export function IconButton(props: IconButtonProps) {
  let content: ReactNode;

  if (props.href) {
    const { href, className, icon: Icon, iconClassName } = props;

    content = (
      <Link
        href={href}
        className={cn(
          "rounded-full",
          className,
          "flex h-10 w-10 items-center justify-center",
          "hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className={cn("size-5", iconClassName)} />
      </Link>
    );
  } else {
    const { className, icon: Icon, iconClassName, onClick } = props;

    content = (
      <Button variant="outline" size="icon" onClick={onClick} className={cn("rounded-full", className)}>
        <Icon className={cn("size-5", iconClassName)} />
      </Button>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      {content}
    </motion.div>
  );
}
