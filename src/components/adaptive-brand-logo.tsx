"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { BrandLogo } from "./brand-logo";
import { FC } from "react";

export const AdaptiveBrandLogo: FC = () => {
  const isMobile = useIsMobile();

  return <BrandLogo hideText={isMobile} className="block sm:hidden" />
}