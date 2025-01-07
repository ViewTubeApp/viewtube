import fs from "fs";
import path from "path";
import { rimraf } from "rimraf";
import "server-only";
import sharp from "sharp";
import { Readable } from "stream";
import { pipeline as pipelinePromise } from "stream/promises";
import { type ReadableStream } from "stream/web";

interface ImageTransformOptions {
  /** Target width in pixels */
  width?: number;
  /** Target height in pixels */
  height?: number;
  /** Quality of the output image (1-100) */
  quality?: number;
  /** How to fit the image within the dimensions */
  fit?: keyof sharp.FitEnum;
  /** Position of the image within the dimensions */
  position?: string | number;
  /** Whether to maintain aspect ratio */
  keepAspectRatio?: boolean;
}

interface ImageFormat {
  /** File extension with dot (e.g. ".webp") */
  extension: string;
  /** MIME type of the format */
  mimeType: string;
  /** Transform function to convert to this format */
  transform: (options: ImageTransformOptions) => sharp.Sharp;
}

interface ImageVariant {
  /** Unique identifier for the variant */
  name: string;
  /** Target format of the variant */
  format: keyof typeof imageFormats;
  /** Transform options for the variant */
  options: ImageTransformOptions;
  /** Optional suffix for the filename (e.g. "@2x") */
  suffix?: string;
}

const imageFormats = {
  webp: {
    extension: ".webp",
    mimeType: "image/webp",
    transform: (options: ImageTransformOptions) => {
      const transform = sharp({ failOn: "error" }).webp({ quality: options.quality ?? 80 });

      if (options.width || options.height) {
        transform.resize({
          width: options.width,
          height: options.height,
          fit: options.fit ?? "cover",
          position: options.position ?? "center",
          withoutEnlargement: true,
        });
      }

      return transform;
    },
  },
  jpeg: {
    extension: ".jpg",
    mimeType: "image/jpeg",
    transform: (options: ImageTransformOptions) => {
      const transform = sharp({ failOn: "error" }).jpeg({ quality: options.quality ?? 80 });

      if (options.width || options.height) {
        transform.resize({
          width: options.width,
          height: options.height,
          fit: options.fit ?? "cover",
          position: options.position ?? "center",
          withoutEnlargement: true,
        });
      }

      return transform;
    },
  },
  // Add more formats as needed
} as const satisfies Record<string, ImageFormat>;

interface FileOutput {
  /** Original file path */
  path: string;
  /** Original file URL */
  url: string;
  /** Optional srcset for responsive images */
  srcset?: string;
  /** Generated variants */
  variants: Record<string, { path: string; url: string }>;
}

/**
 * Write a file to a directory and return the output
 *
 * @example
 * const variants: ImageVariant[] = [
 *   {
 *     name: "thumbnail",
 *     format: "webp",
 *     options: {
 *       width: 320,
 *       height: 240,
 *       quality: 80,
 *       fit: "cover",
 *     },
 *   },
 *   {
 *     name: "medium",
 *     format: "webp",
 *     options: {
 *       width: 640,
 *       height: 480,
 *       quality: 80,
 *     },
 *     suffix: "@2x",
 *   },
 *   {
 *     name: "large",
 *     format: "webp",
 *     options: {
 *       width: 1280,
 *       height: 960,
 *       quality: 80,
 *     },
 *     suffix: "@3x",
 *   },
 * ];
 *
 * const result = await writeFile(file)
 *   .toDir("/uploads")
 *   .as("image", variants);
 *
 * // Result will be:
 * // {
 * //   path: "uuid/image.webp",
 * //   url: "/uploads/uuid/image.webp",
 * //   srcset: "/uploads/uuid/image.webp 320w, /uploads/uuid/image@2x.webp 640w, /uploads/uuid/image@3x.webp 1280w",
 * //   variants: {
 * //     thumbnail: { path: "uuid/image.webp", url: "/uploads/uuid/image.webp" },
 * //     medium: { path: "uuid/image@2x.webp", url: "/uploads/uuid/image@2x.webp" },
 * //     large: { path: "uuid/image@3x.webp", url: "/uploads/uuid/image@3x.webp" }
 * //   }
 * // }
 */
export function writeFile(file: File) {
  return {
    saveTo: (dir: string) => {
      return {
        /**
         * Process file with optional image variants
         * @param fileName Base name for the file without extension
         * @param variants Array of image variants to generate
         */
        saveAs: async (fileName: string, variants?: ImageVariant[]): Promise<FileOutput> => {
          const dirNonce = crypto.randomUUID();
          const absFolderPath = path.join(dir, dirNonce);
          await fs.promises.mkdir(absFolderPath, { recursive: true });

          // If no variants, just save the original file
          if (!variants?.length) {
            const fileExt = path.extname(file.name);
            const newFileName = `${fileName}${fileExt}`;
            const fileWithDir = path.join(dirNonce, newFileName);
            const destPath = path.join(absFolderPath, newFileName);

            const readStream = Readable.fromWeb(file.stream() as ReadableStream);
            const writeStream = fs.createWriteStream(destPath);
            await pipelinePromise(readStream, writeStream);

            return {
              path: fileWithDir,
              url: `/uploads/${dirNonce}/${newFileName}`,
              variants: {},
            };
          }

          const outputs: Record<string, { path: string; url: string; width?: number }> = {};

          // Process each variant
          for (const variant of variants) {
            const format = imageFormats[variant.format];
            const newFileName = `${fileName}${variant.suffix ?? ""}${format.extension}`;
            const fileWithDir = path.join(dirNonce, newFileName);
            const destPath = path.join(absFolderPath, newFileName);

            const writeStream = fs.createWriteStream(destPath);
            const transform = format.transform(variant.options);

            // Create a new readable stream for each variant
            const variantReadStream = Readable.fromWeb(file.stream() as ReadableStream);
            await pipelinePromise(variantReadStream, transform, writeStream);

            outputs[variant.name] = {
              path: fileWithDir,
              url: `/uploads/${dirNonce}/${newFileName}`,
              width: variant.options.width,
            };
          }

          // Generate srcset if variants have width specified
          const srcsetEntries = Object.values(outputs).filter((output) => output.width);
          const srcset =
            srcsetEntries.length ? srcsetEntries.map(({ url, width }) => `${url} ${width}w`).join(", ") : undefined;

          // Use the first variant as the default output
          const firstVariant = variants[0]!;
          const defaultOutput = outputs[firstVariant.name]!;

          return {
            path: defaultOutput.path,
            url: defaultOutput.url,
            srcset,
            variants: outputs,
          };
        },
      };
    },
  };
}

/**
 * Delete a file
 *
 * @example
 * await deleteFile("/uploads/uuid/image.webp");
 */
export async function deleteFile(filePath: string) {
  await rimraf.rimraf(filePath);
}
