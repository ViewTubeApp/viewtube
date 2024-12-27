import { api } from "@/trpc/server";
import "server-only";

export async function loadVideoById(id: string) {
  return api.video.getVideoById({ id, related: true });
}
