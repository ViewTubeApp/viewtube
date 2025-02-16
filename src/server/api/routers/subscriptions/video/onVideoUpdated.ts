import { tracked } from "@trpc/server";
import "server-only";
import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";

import { type IterableEventEmitter } from "@/lib/events";

import { type APIVideoByIdType } from "../../video";

interface SubscriptionParams {
  ee: IterableEventEmitter<{ update: [data: APIVideoByIdType["video"]] }>;
}

export const createOnVideoUpdatedSubscription = ({ ee }: SubscriptionParams) => {
  return publicProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .subscription(async function* ({ input, signal }) {
      const iterable = ee.toIterable("update", { signal });

      for await (const [video] of iterable) {
        if (video.id === input.id) {
          yield tracked(String(video.id), video);
        }
      }
    });
};
