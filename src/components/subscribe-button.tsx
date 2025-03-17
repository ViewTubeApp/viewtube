"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentProps, forwardRef, useState } from "react";

import { cn } from "@/lib/utils";

import { ConfettiButton } from "./ui/confetti";
import { RainbowButton } from "./ui/rainbow-button";

type SubscribeButtonProps = ComponentProps<typeof RainbowButton>;

export const SubscribeButton = forwardRef<HTMLButtonElement, SubscribeButtonProps>(({ className, ...props }, ref) => {
  const [subscribed, setSubscribed] = useState(false);

  const t = useTranslations();

  return (
    <ConfettiButton asChild size="sm" variant={subscribed ? "outline" : "default"}>
      <RainbowButton
        {...props}
        size="sm"
        ref={ref}
        type="button"
        className={cn("text-sm", className)}
        variant={subscribed ? "outline" : "default"}
        disabled={subscribed}
        onClick={() => setSubscribed(!subscribed)}
      >
        <Bell className="size-4" />
        {subscribed ? t("subscribed") : t("subscribe")}
      </RainbowButton>
    </ConfettiButton>
  );
});

SubscribeButton.displayName = "SubscribeButton";
