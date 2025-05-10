import { env } from "@/env";
import invariant from "invariant";
import { UTApi, UTFile } from "uploadthing/server";

const utapi = new UTApi({ token: env.UPLOADTHING_TOKEN });

/**
 * Get a file's URL from its key
 * @param fileKey The file key to get the URL for
 * @param expiresIn Optional expiration time in seconds (defaults to 24 hours)
 * @returns The file URL
 */
export async function getFileUrl(fileKey: string, expiresIn: number = 24 * 60 * 60): Promise<string> {
  const { ufsUrl } = await utapi.generateSignedURL(fileKey, { expiresIn });
  invariant(ufsUrl, `Failed to generate signed URL for file: ${fileKey}`);
  return ufsUrl;
}

export { utapi, UTFile };
