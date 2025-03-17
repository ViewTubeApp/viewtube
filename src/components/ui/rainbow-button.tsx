import React, { forwardRef } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

const rainbowGlowClasses = {
  default: [
    "group relative animate-rainbow",
    "[background-clip:padding-box,border-box,border-box] [background-origin:border-box]",
    "rounded-xl bg-[length:200%]",
    // Rainbow border styling for default
    "border-0 [border:calc(0.08*1rem)_solid_transparent]",
    // Rainbow glow effect
    "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:[filter:blur(calc(0.8*1rem))] before:transition-opacity before:duration-300",
    // Light mode colors for rainbow background
    "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
    // Dark mode colors for rainbow background
    "dark:bg-[linear-gradient(var(--color-primary),var(--color-primary)),linear-gradient(var(--color-primary),rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
  ],
  outline: [
    "group relative animate-rainbow",
    // Rainbow glow effect only, no custom border
    "before:content-[''] before:absolute before:bottom-[-20%] before:left-1/2 before:z-[-1] before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:[filter:blur(calc(0.8*1rem))]",
    "before:opacity-30 hover:before:opacity-60 before:transition-opacity before:duration-300",
    "overflow-visible",
  ],
};

type RainbowButtonProps = React.ComponentProps<typeof Button> & {
  rainbowVariant?: keyof typeof rainbowGlowClasses;
};

export const RainbowButton = forwardRef<HTMLButtonElement, RainbowButtonProps>(
  ({ children, className, variant, rainbowVariant, ...props }, ref) => {
    // Default to matching the button variant with the rainbow variant
    const actualRainbowVariant = rainbowVariant || (variant === "outline" ? "outline" : "default");

    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(rainbowGlowClasses[actualRainbowVariant], className)}
        {...props}
      >
        {children}
      </Button>
    );
  },
);

RainbowButton.displayName = "RainbowButton";
