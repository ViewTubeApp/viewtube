import { api } from "@/trpc/react";
import { type inferReactQueryProcedureOptions } from "@trpc/react-query";

import { type AppRouter } from "@/server/api/root";
import { type GetVideoListSchema } from "@/server/api/routers/video";

type QueryOptions = inferReactQueryProcedureOptions<AppRouter>["video"]["getVideoList"];

export function useVideoListQuery(input: GetVideoListSchema, options?: QueryOptions) {
  return api.video.getVideoList.useQuery(input, options);
}
