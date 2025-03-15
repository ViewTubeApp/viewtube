"use client";

import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { useTheme } from "next-themes";
import React, { type FC, type PropsWithChildren, useCallback, useEffect, useRef } from "react";
import { match } from "ts-pattern";

import { cn } from "@/lib/utils";

interface MagicCardProps {
  className?: string;
  gradientSize?: number;
  gradientTo?: string;
  gradientFrom?: string;
  gradientColor?: string;
  gradientOpacity?: number;
  childrenClassName?: string;
}

const defaultDarkColors = {
  gradientFrom: "#9E7AFF",
  gradientTo: "#FE8BBB",
  gradientColor: "#262626",
};

const defaultLightColors = {
  gradientFrom: "#9E7AFF",
  gradientTo: "#FE8BBB",
  gradientColor: "#00000000",
};

export const MagicCard: FC<PropsWithChildren<MagicCardProps>> = ({
  children,
  className,
  childrenClassName,
  gradientTo: providedGradientTo,
  gradientFrom: providedGradientFrom,
  gradientColor: providedGradientColor,
  gradientSize = 200,
  gradientOpacity = 0.8,
}) => {
  const { theme } = useTheme();

  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const gradientFrom =
    providedGradientFrom ??
    match(theme)
      .with("light", () => defaultLightColors.gradientFrom)
      .otherwise(() => defaultDarkColors.gradientFrom);

  const gradientTo =
    providedGradientTo ??
    match(theme)
      .with("light", () => defaultLightColors.gradientTo)
      .otherwise(() => defaultDarkColors.gradientTo);

  const gradientColor =
    providedGradientColor ??
    match(theme)
      .with("light", () => defaultLightColors.gradientColor)
      .otherwise(() => defaultDarkColors.gradientColor);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (cardRef.current) {
        const { left, top } = cardRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
      }
    },
    [mouseX, mouseY],
  );

  const handleMouseOut = useCallback(
    (e: MouseEvent) => {
      if (!e.relatedTarget) {
        document.removeEventListener("mousemove", handleMouseMove);
        mouseX.set(-gradientSize);
        mouseY.set(-gradientSize);
      }
    },
    [handleMouseMove, mouseX, gradientSize, mouseY],
  );

  const handleMouseEnter = useCallback(() => {
    document.addEventListener("mousemove", handleMouseMove);
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [handleMouseMove, mouseX, gradientSize, mouseY]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [handleMouseEnter, handleMouseMove, handleMouseOut]);

  useEffect(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [gradientSize, mouseX, mouseY]);

  return (
    <div ref={cardRef} className={cn("group relative rounded-[inherit]", className)}>
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-border duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
              ${gradientFrom}, 
              ${gradientTo}, 
            var(--border) 100%
          )
          `,
        }}
      />
      <div className="absolute inset-px rounded-[inherit] bg-background" />
      <motion.div
        className="pointer-events-none absolute inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)
          `,
          opacity: gradientOpacity,
        }}
      />
      <div className={cn("relative size-full", childrenClassName)}>{children}</div>
    </div>
  );
};
