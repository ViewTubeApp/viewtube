import Uppy from "@uppy/core";
import { create } from "zustand";
import XHRUpload from "@uppy/xhr-upload";

interface FileUploadStore {
  client: Uppy;
}

export const useFileUploadStore = create<FileUploadStore>(() => ({
  client: new Uppy({ autoProceed: true }).use(XHRUpload, {
    endpoint: "/api/upload",
  }),
}));
