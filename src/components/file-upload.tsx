"use client";

import { useFileUploadStore } from "@/stores/file-upload";
import { cn } from "@/utils/shared/clsx";
import "@uppy/core/dist/style.min.css";
import { type Restrictions } from "@uppy/core/lib/Restricter";
import "@uppy/dashboard/dist/style.min.css";
import { Dashboard } from "@uppy/react";
import React, { useEffect } from "react";

interface FileUploadProps {
  className?: string;
  restrictions?: Partial<Restrictions>;
}

export function FileUpload({ className, restrictions }: FileUploadProps) {
  const { client } = useFileUploadStore();

  useEffect(() => {
    client.setOptions({ restrictions });
  }, [client, restrictions]);

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

  return (
    <Dashboard
      width="100%"
      theme="dark"
      showProgressDetails
      showRemoveButtonAfterComplete={false}
      proudlyDisplayPoweredByUppy={false}
      hideProgressAfterFinish
      hideUploadButton
      uppy={client}
      className={classes}
    />
  );
}
