import { type Body, type Meta } from "@uppy/core";
import { type XHRUploadOptions } from "@uppy/xhr-upload";
import { useState } from "react";

import { createFileUploadClient } from "@/lib/uppy";

export function useFileUpload(opts: XHRUploadOptions<Meta, Body>) {
  const [client] = useState(() => createFileUploadClient(opts));
  return client;
}
