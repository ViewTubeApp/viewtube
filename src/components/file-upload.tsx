"use client";

import { languageTag } from "@/paraglide/runtime";
import { cn } from "@/utils/shared/clsx";
import { type Uppy } from "@uppy/core";
import "@uppy/core/dist/style.min.css";
import { type Restrictions } from "@uppy/core/lib/Restricter";
import "@uppy/dashboard/dist/style.min.css";
import EnLocale from "@uppy/locales/lib/en_US";
import RuLocale from "@uppy/locales/lib/ru_RU";
import { Dashboard } from "@uppy/react";
import React, { useEffect } from "react";
import { match } from "ts-pattern";

interface FileUploadProps {
  uploadClient: Uppy;
  className?: string;
  restrictions?: Partial<Restrictions>;
}

export const FileUpload = React.memo(({ className, uploadClient, restrictions }: FileUploadProps) => {
  useEffect(() => {
    uploadClient.setOptions({ restrictions });
  }, [uploadClient, restrictions]);

  const classes = cn([
    className,
    "relative isolate",
    "[&_.uppy-Dashboard-inner]:!border-neutral-600",
    "[&_.uppy-Dashboard-inner]:!rounded-xl",
    "[&_.uppy-Dashboard-innerWrap]:!rounded-xl",
    "[&_.uppy-Dashboard-AddFiles]:!rounded-lg",
    "[&_.uppy-DashboardContent-back]:!rounded-tl-lg",
    "[&_.uppy-DashboardContent-back]:!-translate-y-[2px]",
  ]);

  const locale = match(languageTag())
    .with("ru", () => RuLocale)
    .with("en", () => EnLocale)
    .exhaustive();

  return (
    <Dashboard
      locale={locale}
      width="100%"
      theme="dark"
      showProgressDetails
      showRemoveButtonAfterComplete={false}
      proudlyDisplayPoweredByUppy={false}
      hideProgressAfterFinish
      hideUploadButton
      uppy={uploadClient}
      className={classes}
    />
  );
});

FileUpload.displayName = "FileUpload";
