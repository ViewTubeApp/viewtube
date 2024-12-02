import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline as pipelinePromise } from "node:stream/promises";
import ffmpeg from "fluent-ffmpeg";
import { customAlphabet } from "nanoid";
import { env } from "@/env";

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

interface TrailerOptions {
  clipDuration: number; // Duration of each clip in seconds
  skipDuration: number; // Duration to skip between clips in seconds
  outputFilePath: string; // Output file path for the trailer video
  videoDuration: number; // Duration of the original video in seconds
}

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
  // @ts-expect-error ts(2345)
  const readStream = Readable.fromWeb(file.stream());

  await pipelinePromise(readStream, writeStream);

  return { url: createUploadsFileUrl(dirNonce, newFileName), path: fileWithDir };
}

export async function createPoster(fileWithDir: string) {
  const absFilePath = path.resolve(env.UPLOADS_VOLUME, fileWithDir);

  const absDirName = path.dirname(absFilePath);
  const folderName = path.basename(absDirName);

  return new Promise<{ url: string }>((resolve, reject) => {
    ffmpeg(absFilePath)
      .screenshots({
        folder: absDirName,
        filename: "poster.jpg",
        timestamps: [1],
      })
      .on("end", () => resolve({ url: createUploadsFileUrl(folderName, "poster.jpg") }))
      .on("error", (err) => reject(err));
  });
}

export async function createWebVTT(filePath: string) {
  const absFilePath = path.join(env.UPLOADS_VOLUME, filePath);

  const absDirName = path.dirname(absFilePath);
  const folderName = path.basename(absDirName);

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

  const duration = await getVideoDuration(absFilePath);

  const videoInfo: VideoInfo = { filePath: absFilePath, duration };

  const spriteInfo = await generateSpriteImage(videoInfo, thumbOptions, outputPaths.spriteFilePath);

  await generateWebVTT(videoInfo, thumbOptions, spriteInfo, outputPaths);

  return {
    thumbnails: {
      url: createUploadsFileUrl(folderName, "thumbnails.vtt"),
    },
    storyboard: {
      url: createUploadsFileUrl(folderName, "storyboard.jpg"),
    },
  };
}

export async function createTrailer(filePath: string) {
  const absFilePath = path.join(env.UPLOADS_VOLUME, filePath);

  const absDirName = path.dirname(absFilePath);
  const folderName = path.basename(absDirName);
  const videoDuration = await getVideoDuration(absFilePath);

  const options: TrailerOptions = {
    clipDuration: 1, // Duration of each clip in seconds
    skipDuration: 5, // Duration to skip between clips in seconds
    videoDuration, // Duration of the original video in seconds
    outputFilePath: path.join(absDirName, "trailer.mp4"), // Output trailer file path
  };

  await generateTrailer(absFilePath, options);

  return { url: createUploadsFileUrl(folderName, "trailer.mp4") };
}

async function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err: Error, metadata) => {
      if (err) return reject(err);
      const duration = metadata.format.duration;
      if (typeof duration === "number") {
        resolve(duration);
      } else {
        reject(new Error("Unable to determine video duration"));
      }
    });
  });
}

async function generateSpriteImage(videoInfo: VideoInfo, thumbOptions: ThumbnailOptions, outputPath: string): Promise<SpriteInfo> {
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
  const folderName = path.basename(path.dirname(spriteFilePath));
  const spriteFileName = path.basename(spriteFilePath);

  const lines: string[] = ["WEBVTT", ""];

  for (let i = 0; i < numThumbnails; i++) {
    const startTime = i * interval;
    const endTime = Math.min((i + 1) * interval, duration);

    const startTimeStr = formatTime(startTime);
    const endTimeStr = formatTime(endTime);

    const row = Math.floor(i / numColumns);
    const col = i % numColumns;
    const x = col * width;
    const y = row * height;

    lines.push(`${startTimeStr} --> ${endTimeStr}`);
    lines.push(`/uploads/${folderName}/${spriteFileName}#xywh=${x},${y},${width},${height}`);
    lines.push("");
  }

  await fs.promises.writeFile(vttFilePath, lines.join("\n"), "utf-8");
}

async function joinClips(clipPaths: string[], outputFilePath: string): Promise<void> {
  const tempDir = path.dirname(clipPaths[0]!);
  const concatFilePath = path.join(tempDir, `${nanoid()}.txt`);

  const concatFileContent = clipPaths.map((filePath) => `file '${filePath}'`).join("\n");

  return fs.promises.writeFile(concatFilePath, concatFileContent, "utf-8").then(() => {
    return new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(concatFilePath)
        .inputOptions(["-f", "concat", "-safe", "0"])
        .outputOptions(["-c", "copy"])
        .output(outputFilePath)
        .on("end", () => {
          void fs.promises.unlink(concatFilePath);
          resolve();
        })
        .on("error", (err) => {
          void fs.promises.unlink(concatFilePath);
          reject(err);
        })
        .run();
    });
  });
}

async function generateTrailer(videoFilePath: string, options: TrailerOptions): Promise<void> {
  const { clipDuration, skipDuration, outputFilePath, videoDuration } = options;

  const startTimes: number[] = [];
  let startTime = 0;

  while (startTime + clipDuration <= videoDuration) {
    startTimes.push(startTime);
    startTime += clipDuration + skipDuration;
  }

  const tempDir = path.join(os.tmpdir(), `viewtube_${nanoid()}`);
  await fs.promises.mkdir(tempDir, { recursive: true });

  try {
    const extractClip = (startTime: number, index: number): Promise<string> => {
      return new Promise((resolve, reject) => {
        const outputClipPath = path.join(tempDir, `clip_${index}.mp4`);
        ffmpeg(videoFilePath)
          .setStartTime(startTime)
          .duration(clipDuration)
          .output(outputClipPath)
          .on("end", () => resolve(outputClipPath))
          .on("error", (err) => reject(err))
          .run();
      });
    };

    const clipPromises = startTimes.map((time, index) => extractClip(time, index));
    const clipPaths = await Promise.all(clipPromises);

    await joinClips(clipPaths, outputFilePath);

    for (const clipPath of clipPaths) {
      await fs.promises.unlink(clipPath);
    }
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  }
}

function createUploadsFileUrl(dirName: string, fileName: string, hashParams?: string) {
  return `/uploads/${dirName}/${fileName}${hashParams ? `#${hashParams}` : ""}`;
}
