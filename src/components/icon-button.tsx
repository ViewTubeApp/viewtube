"use client";

import { motion } from "motion/react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { type ReactNode } from "react";
import Link from "next/link";
import { type Url } from "url";

type IconButtonProps = {
  icon: LucideIcon;
  className?: string;
} & (
  | {
      href: string | Url;
      onClick?: never;
    }
  | {
      href?: never;
      onClick: () => void;
    }
);

export function IconButton(props: IconButtonProps) {
  let content: ReactNode;

  if (props.href) {
    const { href, className, icon: Icon } = props;

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
        <Icon className="h-5 w-5" />
      </Link>
    );
  } else {
    const { className, icon: Icon, onClick } = props;

    content = (
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className={cn("rounded-full", className)}
      >
        <Icon className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      {content}
    </motion.div>
  );
}
