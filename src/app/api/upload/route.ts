import { env } from "@/env";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/env";

const UPLOAD_DIR = path.resolve(env.ROOT_PATH, "public/uploads");

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const body = Object.fromEntries(formData);
  const file = (body.file as Blob) ?? null;

  let filename = (body.file as File)?.name;

  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR);
    }

    const uuid = crypto.randomUUID();
    const ext = (body.file as File).name.split(".").pop();
    filename = `${uuid}.${ext}`;

    fs.writeFileSync(path.resolve(UPLOAD_DIR, filename), buffer);
  } else {
    return NextResponse.json({ success: false });
  }

  return NextResponse.json({
    success: true,
    path: `${getBaseUrl()}/uploads/${filename}`,
  });
}
