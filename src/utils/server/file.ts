import fs from "fs";
import path from "path";
import { rimraf } from "rimraf";
import "server-only";
import { Readable } from "stream";
import { pipeline as pipelinePromise } from "stream/promises";
import { type ReadableStream } from "stream/web";

export function prepareFileWrite(dir: string) {
  return {
    writeFileToDisk: (file: File) => {
      return {
        withFileName: async (fileName: string) => {
          const dirNonce = crypto.randomUUID();

          const absFolderPath = path.join(dir, dirNonce);
          await fs.promises.mkdir(absFolderPath, { recursive: true });

          const fileExt = path.extname(file.name);
          const newFileName = `${fileName}${fileExt}`;
          const fileWithDir = path.join(dirNonce, newFileName);

          const destPath = path.join(absFolderPath, newFileName);

          const writeStream = fs.createWriteStream(destPath);
          const readStream = Readable.fromWeb(file.stream() as ReadableStream);

          await pipelinePromise(readStream, writeStream);

          return {
            path: fileWithDir,
            url: `/uploads/${dirNonce}/${newFileName}`,
          } as const;
        },
      };
    },
  };
}

export async function deleteFileFromDisk(filePath: string) {
  await rimraf.rimraf(filePath);
}
