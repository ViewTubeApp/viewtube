import { type ComponentProps, type FC } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "./badge";

export const Tag: FC<ComponentProps<typeof Badge>> = ({ children, className, variant = "default", ...props }) => {
  return (
    <Badge {...props} variant={variant} className={cn("rounded-sm px-1 font-normal", className)}>
      {children}
    </Badge>
  );
};
