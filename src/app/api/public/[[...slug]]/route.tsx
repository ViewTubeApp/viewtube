import path from "node:path";
import fs from "node:fs";
import { NextResponse } from "next/server";

const publicDir = path.join(process.cwd(), "public");

interface GetParams {
  params: Promise<{ slug: string[] }>;
}

export async function GET(_: Request, { params }: GetParams) {
  const slug = (await params).slug;
  const filePath = path.join(publicDir, ...slug);

  const readStream = fs.createReadStream(filePath);
  const readableStream = new ReadableStream({
    start(controller) {
      readStream.on("data", (chunk) => controller.enqueue(chunk));
      readStream.on("end", () => controller.close());
      readStream.on("error", (err) => controller.error(err));
    },
  });

  return new NextResponse(readableStream);
}
