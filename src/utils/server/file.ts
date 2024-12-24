import { env } from "@/env";
import fs from "fs";
import { customAlphabet } from "nanoid";
import path from "path";
import { rimraf } from "rimraf";
import "server-only";
import { Readable } from "stream";
import { pipeline as pipelinePromise } from "stream/promises";
import { type ReadableStream } from "stream/web";

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

  return { url: `/uploads/${dirNonce}/${newFileName}`, path: fileWithDir };
}

export async function deleteFileFromDisk(filePath: string) {
  await rimraf.rimraf(filePath);
}
