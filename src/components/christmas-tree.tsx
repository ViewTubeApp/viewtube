"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { type FC } from "react";

import { cn } from "@/lib/utils";

interface ChristmasTreeProps {
  className?: string;
}

export const ChristmasTree: FC<ChristmasTreeProps> = ({ className }) => {
  return (
    <div className={cn("pointer-events-none pt-2 px-1", className)}>
      <DotLottieReact src="/lottie/christmas-tree.lottie" loop autoplay className="size-full -translate-x-4" />
    </div>
  );
};
