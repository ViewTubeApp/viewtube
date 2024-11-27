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
  // @ts-expect-error ts(2345)
  return new NextResponse(fs.createReadStream(filePath));
}
