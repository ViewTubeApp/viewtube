"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { type FC } from "react";

import { cn } from "@/lib/utils";

interface ChristmasLightsProps {
  className?: string;
}

export const ChristmasLights: FC<ChristmasLightsProps> = ({ className }) => {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <DotLottieReact src="/lottie/christmas-lights.lottie" loop autoplay className="size-full translate-y-1/2" />
    </div>
  );
};
