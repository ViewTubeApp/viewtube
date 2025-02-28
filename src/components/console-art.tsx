"use client";

import { displayConsoleArt } from "@/utils/server/console-art";
import type { FC } from "react";
import { useEffect, useRef } from "react";

export const ConsoleArt: FC = () => {
  const isDisplayed = useRef(false);

  useEffect(() => {
    if (!isDisplayed.current) {
      displayConsoleArt();
      isDisplayed.current = true;
    }
  }, []);

  return null;
};
