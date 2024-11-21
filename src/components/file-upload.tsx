"use client";

import React, { useEffect } from "react";
import { Dashboard } from "@uppy/react";
import { type Restrictions } from "@uppy/core/lib/Restricter";
import { useFileUploadStore } from "@/lib/store/file-upload";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  restrictions?: Partial<Restrictions>;
}

export function FileUpload({ restrictions }: FileUploadProps) {
  const { client } = useFileUploadStore();

  useEffect(() => {
    client.setOptions({ restrictions });
  }, [client, restrictions]);

  const className = cn([
    "[&_.uppy-Dashboard-inner]:!border-neutral-600",
    "[&_.uppy-Dashboard-inner]:!rounded-xl",
    "[&_.uppy-Dashboard-innerWrap]:!rounded-xl",
    "[&_.uppy-Dashboard-AddFiles]:!rounded-lg",
  ]);

  return (
    <Dashboard
      theme="dark"
      showProgressDetails
      proudlyDisplayPoweredByUppy={false}
      uppy={client}
      className={className}
    />
  );
}
