import { env } from "@/env";
import { createUrlBuilder } from "./shared";

export function getClientVideoUrls() {
  return createUrlBuilder(env.NEXT_PUBLIC_CDN_URL);
}
