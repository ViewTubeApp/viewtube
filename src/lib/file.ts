import fs, { type PathLike } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import ffmpeg from "fluent-ffmpeg";

export async function saveFile(file: File, root: PathLike) {
  const nonce = crypto.randomUUID();
  const folder = path.normalize(
    path.resolve(`${root.toString()}/public/uploads/${nonce}`),
  );

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const fd = fs.createWriteStream(`${folder}/${file.name}`);
  // @ts-expect-error - Readable.fromWeb is not typed
  const stream = Readable.fromWeb(file.stream());

  for await (const chunk of stream) {
    fd.write(chunk);
  }

  fd.end();

  return {
    name: file.name,
    url: `/uploads/${nonce}/${file.name}`,
  };
}

export async function createThumbnail(source: PathLike, root: PathLike) {
  const nonce = crypto.randomUUID();
  const input = path.normalize(
    `${root.toString()}/public/${source.toString()}`,
  );

  const absolutePath = path.dirname(input);
  const folderName = path.dirname(input).split("/").pop();

  return new Promise<{ url: string }>((resolve, reject) => {
    ffmpeg(input)
      .screenshots({
        folder: absolutePath,
        filename: `thumb_${nonce}.jpg`,
        timestamps: [1],
      })
      .on("end", () =>
        resolve({ url: `/uploads/${folderName}/thumb_${nonce}.jpg` }),
      )
      .on("error", (err) => reject(err));
  });
}
