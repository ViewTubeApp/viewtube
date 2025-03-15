"use client";

import { ShowMore, type ShowMoreProps, type ShowMoreRef, type ShowMoreToggleLinesFn } from "@re-dev/react-truncate";
import { useTranslations } from "next-intl";
import { type FC, type PropsWithoutRef, useRef } from "react";

import { Button } from "./ui/button";

export const TextExpander: FC<PropsWithoutRef<ShowMoreProps>> = ({ children, ...props }) => {
  const t = useTranslations();

  const ref = useRef<ShowMoreRef>(null);

  const toggleLines: ShowMoreToggleLinesFn = (e) => {
    ref.current?.toggleLines(e);
  };

  return (
    <ShowMore
      ref={ref}
      {...props}
      more={
        <>
          {"…"}
          <Button variant="link" size="sm" className="text-sm ml-1 h-auto p-0" onClick={toggleLines}>
            {t("show_more")}
          </Button>
        </>
      }
      less={
        <Button variant="link" size="sm" className="text-sm h-auto p-0" onClick={toggleLines}>
          {t("show_less")}
        </Button>
      }
    >
      {children}
    </ShowMore>
  );
};
