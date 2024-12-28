import { api } from "@/trpc/react";
import { type inferReactQueryProcedureOptions } from "@trpc/react-query";

import { type AppRouter } from "@/server/api/root";
import { type GetVideoByIdSchema } from "@/server/api/routers/video";

type QueryOptions = inferReactQueryProcedureOptions<AppRouter>["video"]["getVideoById"];

export function useVideoByIdQuery(input: GetVideoByIdSchema, options?: QueryOptions) {
  return api.video.getVideoById.useQuery(input, options);
}
