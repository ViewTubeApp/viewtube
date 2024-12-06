import Uppy from "@uppy/core";
import { create } from "zustand";

interface FileUploadStore {
  client: Uppy;
}

export const useFileUploadStore = create<FileUploadStore>(() => ({
  client: new Uppy({ autoProceed: false }),
}));
