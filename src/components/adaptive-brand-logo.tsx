"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import type { FC } from "react";

import { BrandLogo } from "./brand-logo";

export const AdaptiveBrandLogo: FC = () => {
  const isMobile = useIsMobile();
  return <BrandLogo hideText={isMobile} className="block sm:hidden" />;
};
