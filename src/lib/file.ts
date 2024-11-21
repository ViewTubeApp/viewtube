import fs, { type PathLike } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Readable } from "node:stream";

export async function saveFile(file: File, root: PathLike) {
  const nonce = crypto.randomUUID();
  const dir = path.resolve(`${root.toString()}/public/uploads/${nonce}`);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const fd = fs.createWriteStream(`${dir}/${file.name}`);
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
