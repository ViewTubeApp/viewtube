import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import { create } from "zustand";

interface FileUploadStore {
  client: Uppy;
}

export const useFileUploadStore = create<FileUploadStore>(() => ({
  client: new Uppy({ autoProceed: false }).use(XHRUpload, {
    formData: true,
    fieldName: "file",
    endpoint: "/api/trpc/video.uploadVideo",
  }),
}));
