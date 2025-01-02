import Uppy, { type Body, type Meta } from "@uppy/core";
import XHRUpload, { type XHRUploadOptions } from "@uppy/xhr-upload";

export function createFileUploadClient(opts: XHRUploadOptions<Meta, Body>) {
  return new Uppy({ autoProceed: false }).use(XHRUpload, {
    ...opts,
    formData: true,
    fieldName: "file",
  });
}
