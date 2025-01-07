import fs from "fs";
import path from "path";
import { rimraf } from "rimraf";
import "server-only";
import sharp from "sharp";
import { Readable } from "stream";
import { pipeline as pipelinePromise } from "stream/promises";
import { type ReadableStream } from "stream/web";

interface OptimizationConfig {
  transform: () => sharp.Sharp;
  extension: string;
}

export const optimizations = {
  webp: (): OptimizationConfig => ({
    transform: () => sharp().webp({ quality: 80 }),
    extension: ".webp",
  }),
} as const;

export type Optimization = (typeof optimizations)[keyof typeof optimizations];

export function writeFile(file: File) {
  return {
    toDir: (dir: string) => {
      return {
        as: async (fileName: string, optimization?: Optimization) => {
          const dirNonce = crypto.randomUUID();

          const absFolderPath = path.join(dir, dirNonce);
          await fs.promises.mkdir(absFolderPath, { recursive: true });

          const config = optimization?.();
          const fileExt = config?.extension ?? path.extname(file.name);
          const newFileName = `${fileName}${fileExt}`;
          const fileWithDir = path.join(dirNonce, newFileName);

          const destPath = path.join(absFolderPath, newFileName);

          const readStream = Readable.fromWeb(file.stream() as ReadableStream);
          const writeStream = fs.createWriteStream(destPath);

          if (config) {
            await pipelinePromise(readStream, config.transform(), writeStream);
          } else {
            await pipelinePromise(readStream, writeStream);
          }

          return {
            path: fileWithDir,
            url: `/uploads/${dirNonce}/${newFileName}`,
          } as const;
        },
      };
    },
  };
}

export async function deleteFile(filePath: string) {
  await rimraf.rimraf(filePath);
}
