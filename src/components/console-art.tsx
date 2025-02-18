"use client";

import { displayConsoleArt } from "@/utils/server/console-art";
import { FC, useEffect, useRef } from "react";

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
