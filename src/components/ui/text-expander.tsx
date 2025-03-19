"use client";

import { ShowMore, type ShowMoreProps } from "@re-dev/react-truncate";
import { useTranslations } from "next-intl";
import { type PropsWithoutRef, memo, useState } from "react";

import { Button } from "./button";

export const TextExpander = memo<PropsWithoutRef<ShowMoreProps>>(({ children, ...props }) => {
  const t = useTranslations();

  const [expanded, setExpanded] = useState(false);

  const more = (
    <>
      {"…"}
      <Button variant="link" size="sm" className="text-sm ml-1 h-auto p-0" onClick={() => setExpanded(true)}>
        {t("show_more")}
      </Button>
    </>
  );

  const less = (
    <Button variant="link" size="sm" className="text-sm ml-1 h-auto p-0" onClick={() => setExpanded(false)}>
      {t("show_less")}
    </Button>
  );

  return (
    <ShowMore {...props} expanded={expanded} more={more} less={less}>
      {children}
    </ShowMore>
  );
});

TextExpander.displayName = "TextExpander";
