"use client";

import { cn } from "@/utils/shared/clsx";
import { type Body, type Meta } from "@uppy/core";
import "@uppy/core/dist/style.min.css";
import { type Restrictions } from "@uppy/core/lib/Restricter";
import "@uppy/dashboard/dist/style.min.css";
import EnLocale from "@uppy/locales/lib/en_US";
import RuLocale from "@uppy/locales/lib/ru_RU";
import { Dashboard } from "@uppy/react";
import { type DashboardProps } from "@uppy/react/lib/Dashboard";
import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import React, { useEffect } from "react";
import { match } from "ts-pattern";

interface FileUploadProps extends DashboardProps<Meta, Body> {
  className?: string;
  restrictions?: Partial<Restrictions>;
}

export const FileUpload = React.memo(({ className, uppy, restrictions, ...props }: FileUploadProps) => {
  const locale = useLocale();
  const { theme } = useTheme();

  useEffect(() => {
    uppy.setOptions({ restrictions });
  }, [uppy, restrictions]);

  const classes = cn([
    className,
    "relative isolate",
    "[&_.uppy-Dashboard-inner]:!border-border",
    "[&_.uppy-Dashboard-inner]:!rounded-xl",
    "[&_.uppy-Dashboard-innerWrap]:!rounded-xl",
    "[&_.uppy-Dashboard-AddFiles]:!rounded-lg",
    "[&_.uppy-DashboardContent-back]:!rounded-tl-lg",
    "[&_.uppy-DashboardContent-back]:!-translate-y-[2px]",
  ]);

  const dashboardLocale = match(locale)
    .with("ru", () => RuLocale)
    .with("en", () => EnLocale)
    .exhaustive();

  return (
    <Dashboard
      {...props}
      locale={dashboardLocale}
      width="100%"
      className={classes}
      hideUploadButton
      uppy={uppy}
      showProgressDetails
      hideProgressAfterFinish
      theme={theme as "dark" | "light"}
      showRemoveButtonAfterComplete={false}
      proudlyDisplayPoweredByUppy={false}
    />
  );
});

FileUpload.displayName = "FileUpload";
