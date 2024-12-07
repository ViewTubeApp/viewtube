import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { type ReadableStream } from "stream/web";
import { pipeline as pipelinePromise } from "stream/promises";
import { customAlphabet } from "nanoid";
import { env } from "@/env";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 12);

export async function writeFileToDisk(file: File) {
  const dirNonce = nanoid();
  const fileNonce = nanoid();

  const absFolderPath = path.join(env.UPLOADS_VOLUME, dirNonce);
  await fs.promises.mkdir(absFolderPath, { recursive: true });

  const fileExt = path.extname(file.name);
  const newFileName = `${fileNonce}${fileExt}`;
  const fileWithDir = path.join(dirNonce, newFileName);

  const destPath = path.join(absFolderPath, newFileName);

  const writeStream = fs.createWriteStream(destPath);
  const readStream = Readable.fromWeb(file.stream() as ReadableStream);

  await pipelinePromise(readStream, writeStream);

  return { url: createUploadsFileUrl(dirNonce, newFileName), path: fileWithDir };
}

function createUploadsFileUrl(dirName: string, fileName: string, hashParams?: string) {
  return `/uploads/${dirName}/${fileName}${hashParams ? `#${hashParams}` : ""}`;
}
