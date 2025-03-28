import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/react/clsx";
import { type LucideIcon } from "lucide-react";
import * as motion from "motion/react-client";
import { type ReactNode, forwardRef } from "react";
import { type Url } from "url";

import { Button } from "./button";

type IconButtonProps = {
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  buttonClassName?: string;
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

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  let content: ReactNode;

  if (props.href) {
    const { href, buttonClassName, icon: Icon, iconClassName, ...rest } = props;

    content = (
      <Link
        {...rest}
        href={href}
        className={cn(
          "rounded-full",
          buttonClassName,
          "flex h-10 w-10 items-center justify-center",
          "hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className={cn("size-5", iconClassName)} />
      </Link>
    );
  } else {
    const { buttonClassName, icon: Icon, iconClassName, onClick, ...rest } = props;

    content = (
      <Button
        {...rest}
        ref={ref}
        type="button"
        variant="outline"
        size="icon"
        onClick={onClick}
        className={cn("rounded-full", buttonClassName)}
      >
        <Icon className={cn("size-5", iconClassName)} />
      </Button>
    );
  }

  const { className } = props;

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={className}>
      {content}
    </motion.div>
  );
});

IconButton.displayName = "IconButton";
