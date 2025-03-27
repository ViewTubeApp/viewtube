import { type FileRouter, createUploadthing } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const router = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  image_uploader: f({
    image: {
      maxFileCount: 1,
      maxFileSize: "4MB",
    },
  }).onUploadComplete(async ({ metadata: _, file: __ }) => {}),

  video_uploader: f({
    video: {
      maxFileCount: 1,
      maxFileSize: "1GB",
    },
  }).onUploadComplete(async ({ metadata: _, file: __ }) => {}),
} satisfies FileRouter;

export type UploadFileRouter = typeof router;
