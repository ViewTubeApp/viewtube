import "server-only";

import fs, { type PathLike } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import ffmpeg from "fluent-ffmpeg";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 12);

export async function writeFileToDisk(file: File, rootPath: PathLike) {
  const nonce = crypto.randomUUID();

  const absFolderPath = path.join(
    rootPath.toString(),
    "public",
    "uploads",
    nonce,
  );

  if (!fs.existsSync(absFolderPath)) {
    fs.mkdirSync(absFolderPath, { recursive: true });
  }

  const fileExt = path.extname(file.name);
  const newFileName = `${nanoid()}${fileExt}`;

  const fd = fs.createWriteStream(`${absFolderPath}/${newFileName}`);
  // @ts-expect-error - Readable.fromWeb is not typed
  const stream = Readable.fromWeb(file.stream());

  for await (const chunk of stream) {
    fd.write(chunk);
  }

  fd.end();

  return { url: `/uploads/${nonce}/${newFileName}` };
}

export async function createPoster(filePath: PathLike, rootPath: PathLike) {
  const absFilePath = path.join(
    rootPath.toString(),
    "public",
    filePath.toString(),
  );

  const absDirName = path.dirname(absFilePath);
  const folderName = path.dirname(absFilePath).split("/").pop();

  return new Promise<{ url: string }>((resolve, reject) => {
    ffmpeg(absFilePath)
      .screenshots({
        folder: absDirName,
        filename: "poster.jpg",
        timestamps: [1],
      })
      .on("end", () => resolve({ url: `/uploads/${folderName}/poster.jpg` }))
      .on("error", (err) => reject(err));
  });
}

interface ThumbnailOptions {
  interval: number; // in seconds
  width: number;
  height: number;
  numColumns: number;
}

interface VideoInfo {
  filePath: string;
  duration: number;
}

interface OutputPaths {
  spriteFilePath: string;
  vttFilePath: string;
}

interface SpriteInfo {
  numThumbnails: number;
  numRows: number;
}

async function getVideoInfo(filePath: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err as Error);
      const duration = metadata.format.duration;
      if (typeof duration === "number") {
        resolve({ filePath, duration });
      } else {
        reject(new Error("Unable to determine video duration"));
      }
    });
  });
}

async function generateSpriteImage(
  videoInfo: VideoInfo,
  thumbOptions: ThumbnailOptions,
  outputPath: string,
): Promise<SpriteInfo> {
  return new Promise((resolve, reject) => {
    const { duration, filePath } = videoInfo;
    const { interval, numColumns, width, height } = thumbOptions;

    const totalFrames = Math.ceil(duration / interval);
    const numRows = Math.ceil(totalFrames / numColumns);

    const fps = 1 / interval;
    const filterComplex = `[0:v] fps=${fps},scale=${width}:${height},tile=${numColumns}x${numRows} [tile]`;

    ffmpeg(filePath)
      .complexFilter(filterComplex, "tile")
      .outputOptions(["-frames:v 1"])
      .output(outputPath)
      .on("end", () => resolve({ numThumbnails: totalFrames, numRows }))
      .on("error", (err) => reject(err))
      .run();
  });
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toFixed(3).padStart(6, "0");
  return `${h}:${m}:${s}`;
}

async function generateWebVTT(
  videoInfo: VideoInfo,
  thumbOptions: ThumbnailOptions,
  spriteInfo: SpriteInfo,
  outputPaths: OutputPaths,
): Promise<void> {
  const { duration } = videoInfo;
  const { interval, numColumns, width, height } = thumbOptions;
  const { numThumbnails } = spriteInfo;
  const { vttFilePath, spriteFilePath } = outputPaths;
  const folderName = path.dirname(spriteFilePath).split("/").pop();
  const spriteFileName = path.basename(spriteFilePath);

  let vttContent = "WEBVTT\n\n";

  for (let i = 0; i < numThumbnails; i++) {
    const startTime = i * interval;
    const endTime = Math.min((i + 1) * interval, duration);

    const startTimeStr = formatTime(startTime);
    const endTimeStr = formatTime(endTime);

    const row = Math.floor(i / numColumns);
    const col = i % numColumns;
    const x = col * width;
    const y = row * height;

    vttContent += `${startTimeStr} --> ${endTimeStr}\n`;
    vttContent += `/uploads/${folderName}/${spriteFileName}#xywh=${x},${y},${width},${height}\n\n`;
  }

  fs.writeFileSync(vttFilePath, vttContent);
}

export async function createWebVTT(filePath: PathLike, rootPath: PathLike) {
  const absFilePath = path.join(
    rootPath.toString(),
    "public",
    filePath.toString(),
  );

  const absDirName = path.dirname(absFilePath);
  const folderName = path.dirname(absFilePath).split("/").pop();

  const outputPaths: OutputPaths = {
    vttFilePath: path.join(absDirName, "thumbnails.vtt"),
    spriteFilePath: path.join(absDirName, "storyboard.jpg"),
  };

  const thumbOptions: ThumbnailOptions = {
    interval: 1, // interval in seconds
    numColumns: 5, // number of columns in the sprite image
    width: 160, // thumbnail width
    height: 90, // thumbnail height
  };

  const videoInfo = await getVideoInfo(absFilePath);

  const spriteInfo = await generateSpriteImage(
    videoInfo,
    thumbOptions,
    outputPaths.spriteFilePath,
  );

  await generateWebVTT(videoInfo, thumbOptions, spriteInfo, outputPaths);

  return {
    thumbnails: {
      url: path.normalize(`/uploads/${folderName}/thumbnails.vtt`),
    },
    stroyboard: {
      url: path.normalize(`/uploads/${folderName}/storyboard.jpg`),
    },
  };
}
