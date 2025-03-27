import { type UploadFileRouter } from "@/app/api/uploadthing/core";
import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

export const UploadButton = generateUploadButton<UploadFileRouter>();
export const UploadDropzone = generateUploadDropzone<UploadFileRouter>();
